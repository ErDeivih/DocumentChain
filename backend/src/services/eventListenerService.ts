import { getContracts, provider } from '../config/blockchain';
import { FlowLogger, FlowContext } from '../utils/logger';
import prisma from '../config/database';

import * as EventHandlers from './eventHandlers';

interface EventHandlerEntry {
  eventName: string;
  handler: EventHandlers.EventHandlerFn;
}

const EVENT_HANDLERS: EventHandlerEntry[] = [
  { eventName: 'DocumentCreated', handler: EventHandlers.handleDocumentCreated },
  { eventName: 'VersionCreated', handler: EventHandlers.handleVersionCreated },
  { eventName: 'DocumentShared', handler: EventHandlers.handleDocumentShared },
  { eventName: 'PermissionRevoked', handler: EventHandlers.handlePermissionRevoked },
  { eventName: 'DocumentSigned', handler: EventHandlers.handleDocumentSigned },
  { eventName: 'DocumentDeleted', handler: EventHandlers.handleDocumentDeleted },
  { eventName: 'VersionRestored', handler: EventHandlers.handleVersionRestored },
  { eventName: 'DocumentArchived', handler: EventHandlers.handleDocumentArchived },
  { eventName: 'OwnershipTransferred(bytes32,address,address,uint256)', handler: EventHandlers.handleOwnershipTransferred },
  { eventName: 'OperationalVersionChanged', handler: EventHandlers.handleOperationalVersionChanged },
  { eventName: 'AdminRoleGranted', handler: EventHandlers.handleAdminRoleGranted },
  { eventName: 'AdminRoleRevoked', handler: EventHandlers.handleAdminRoleRevoked },
];

class EventListenerService {
  private isListening = false;
  private flowLogger: FlowLogger;

  constructor() {
    this.flowLogger = new FlowLogger(FlowContext.BLOCKCHAIN);
  }

  async start(): Promise<void> {
    if (this.isListening) return;

    this.flowLogger.start('START_EVENT_LISTENERS', { action: 'Inicializando listeners de eventos blockchain' });

    try {
      const contracts = getContracts();

      await this.syncHistoricalEvents();

      for (const { eventName, handler } of EVENT_HANDLERS) {
        contracts.documentRegistry.on(eventName, async (...args: any[]) => {
          const event = args[args.length - 1] as any;
          const eventArgs = event?.args ? event.args : args[0];
          await handler(eventArgs, event);
        });
      }

      this.isListening = true;
      this.flowLogger.success({ listeners: EVENT_HANDLERS.map(h => h.eventName) });
    } catch (error) {
      this.flowLogger.error(error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }

  async stop(): Promise<void> {
    if (!this.isListening) return;
    getContracts().documentRegistry.removeAllListeners();
    this.isListening = false;
  }

  async shutdown(): Promise<void> {
    if (this.isListening) await this.stop();
    await prisma.$disconnect();
  }

  private async syncHistoricalEvents(): Promise<void> {
    this.flowLogger.start('SYNC_HISTORICAL_EVENTS', { action: 'Sincronizando eventos históricos de blockchain' });

    try {
      const lastSyncRecord = await prisma.systemStats.findFirst({
        where: { statType: 'BLOCKCHAIN_SYNC' },
        orderBy: { createdAt: 'desc' },
      });

      const lastSyncedBlock = lastSyncRecord?.lastSyncedBlock || 0;
      const currentBlock = await provider.getBlockNumber();

      if (lastSyncedBlock >= currentBlock) {
        this.flowLogger.step('Ya sincronizado', { lastSyncedBlock, currentBlock });
        return;
      }

      this.flowLogger.step('Sincronizando bloques', { fromBlock: lastSyncedBlock + 1, toBlock: currentBlock, totalBlocks: currentBlock - lastSyncedBlock });

      const contracts = getContracts();
      const filter = { fromBlock: lastSyncedBlock + 1, toBlock: currentBlock };
      let totalEvents = 0;

      const allEventResults = await Promise.all(
        EVENT_HANDLERS.map(async ({ eventName, handler }) => {
          const events = await contracts.documentRegistry.queryFilter(
            contracts.documentRegistry.filters[eventName](), filter.fromBlock, filter.toBlock
          );
          for (const evt of events) {
            await handler((evt as any).args || {}, evt);
          }
          return events.length;
        })
      );
      totalEvents = allEventResults.reduce((sum, count) => sum + count, 0);

      const now = new Date();
      await prisma.systemStats.upsert({
        where: { id: lastSyncRecord?.id || 'default' },
        create: { id: 'default', statType: 'BLOCKCHAIN_SYNC', periodStart: now, periodEnd: now, lastSyncedBlock: currentBlock },
        update: { lastSyncedBlock: currentBlock, periodEnd: now },
      });

      this.flowLogger.success({ fromBlock: lastSyncedBlock + 1, toBlock: currentBlock, totalEvents });
    } catch (error) {
      this.flowLogger.error(error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }
}

export default new EventListenerService();
