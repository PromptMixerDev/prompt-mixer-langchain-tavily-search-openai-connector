# Simple Echo Connector

This repository contains a simplified connector that uses an echo function to simulate responses from a chat model. It's designed to mimic the behavior of more complex connectors (like those interfacing with models such as Ollama), but without the need for external API calls. This can be particularly useful for testing, development, or educational purposes.

## Features

- Echo function that simulates chat responses
- Mapping of chat completions to a standardized response format
- Simple integration into existing TypeScript projects
- Configurable to simulate different model types

## Installation

Before installing this connector, ensure you have [Node.js](https://nodejs.org/) installed on your system.

1. **Clone the repository**

```bash
git clone https://github.com/PromptMixerDev/prompt-mixer-sample-connector.git
cd prompt-mixer-sample-connector
```

2. **Install dependencies**

```bash
npm install
```

This will install all necessary dependencies, including TypeScript and any types required for development.

## Configuration

The `config` object can be adjusted to suit your needs. It's located in `config.ts`. By default, it might include placeholders for various configurations. Ensure you review and update it as necessary for your project.

## Contributing

Contributions are welcome! If you have improvements or bug fixes, please follow these steps:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -am 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License

## Acknowledgments

- This project is inspired by the need for simple, mock connectors in development environments.
- Thanks to all contributors and users for their interest and feedback.
