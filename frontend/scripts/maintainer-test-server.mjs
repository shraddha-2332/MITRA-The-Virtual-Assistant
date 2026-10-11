// Only the browser-test harness launches this process, with its own temporary DATABASE_FILE.
import { config } from '../../backend/src/config.js';
import { createServer } from '../../backend/src/server.js';
import { closeDb } from '../../backend/src/store.js';

if (!process.send || !process.env.MITRA_MAINTAINER_TEST) throw new Error('Launch through the maintainer browser harness');
config.geminiApiKey = '';
const server = createServer();
server.listen(config.port, '127.0.0.1', () => process.send({ port: server.address().port }));
process.on('message', message => {
  if (message !== 'shutdown') return;
  server.close(() => { closeDb(); process.disconnect(); });
  server.closeAllConnections();
});
