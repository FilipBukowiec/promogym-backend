module.exports = {
  apps: [
    {
      name: 'app-promogym-backend', // Nazwa aplikacji
      script: 'dist/main.js', // Główna aplikacja, która będzie uruchamiana (skompilowana wersja JS)
      env: {
        NODE_ENV: 'production', // Ustawienie zmiennej środowiskowej dla produkcji
      },
    },
  ],
};
