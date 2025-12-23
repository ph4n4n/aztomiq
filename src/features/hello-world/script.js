document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('change-btn');
  const greeting = document.getElementById('greeting');

  const messages = [
    "Hello, world!",
    "Chào thế giới!",
    "Hola mundo!",
    "Bonjour le monde!",
    "Ciao mondo!"
  ];

  let current = 0;

  if (btn && greeting) {
    btn.onclick = () => {
      current = (current + 1) % messages.length;
      greeting.innerText = messages[current];
    };
  }
});
