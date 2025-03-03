import { configureServer } from './app.server';

(async function main() {
  const PORT = process.env.PORT || 3000;
  const server = await configureServer();

  await server.listen(PORT, '0.0.0.0');
})().catch((error) => {
  console.error('Error starting the server:', error);
  process.exit(1);
});
