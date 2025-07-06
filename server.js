const cluster = require('cluster');
const os = require('os');

const numCPUs = os.availableParallelism?.() || os.cpus().length;

if (cluster.isMaster) {
  console.log(`Master ${process.pid} is running`);

  // Fork workers
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died`);
  });
} else {
  // Workers share the same server port
  require('./app'); // Your Express app code
  console.log(`Worker ${process.pid} started`);
}
