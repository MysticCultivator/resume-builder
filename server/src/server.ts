import app from './app';

const PORT = Number(process.env.PORT) || 5000;

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Resume Builder API listening on http://localhost:${PORT}`);
});
