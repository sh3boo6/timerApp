# timerApp
Cross-platform simple timer desktop app using Electron, Vue 3, Vite, and Tailwind CSS.
=======
# ⏱️ Electron Vue Vite Timer App

A clean and modern desktop **timer application** built with:

- ⚡ [Vite](https://vitejs.dev/)
- 🖼️ [Vue 3](https://vuejs.org/)
- 🎨 [Tailwind CSS](https://tailwindcss.com/)
- ⚙️ [Electron](https://www.electronjs.org/)
- 🧩 [Pinia](https://pinia.vuejs.org/) for state management
- 🗺️ [Vue Router](https://router.vuejs.org/) for routing

---

## 📸 Screenshot

> *(Add a screenshot here: `./screenshot.png`)*

---

## 🚀 Features

- ⏳ Countdown timer with sound alert
- 📌 Always on top option
- 🌙 Dark mode support
- 💨 Fast startup using Vite
- 📦 Cross-platform build via `electron-builder`
- 🧩 Component-based structure using Vue 3
- ⚡ Lightweight and performant

---

## 🛠️ Getting Started

### Clone the repo

```bash
git clone https://github.com/sh3boo6/timerApp.git
cd timerApp
```

### Install dependencies

```bash
npm install
```

### Run in development mode

```bash
npm run dev
```

### Build for production

```bash
npm run build
```

### Build for Windows (explicit)

```bash
npm run build:win
```

---

## 📁 Project Structure

```
timerApp/
├── dist/                  # Built web assets
├── dist-electron/         # Built Electron app
├── public/                # Static assets
├── src/
│   ├── assets/
│   ├── components/
│   ├── views/
│   ├── stores/            # Pinia stores
│   ├── router/            # Vue Router
│   ├── App.vue
│   └── main.ts
├── electron/              # Electron main process
│   └── main.ts
├── vite.config.ts
├── package.json
└── README.md
```

---

## 🔒 License

Licensed under the [MIT License](./LICENSE).

---

## ✍️ Author

**Mohammed A Alomari**  
GitHub: [@sh3boo6](https://github.com/sh3boo6)

---

## 📬 Contribute

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

---

> Built with ❤️ using Electron + Vue + Vite
>>>>>>> 00f78ce (First commit: Upload timer app)
