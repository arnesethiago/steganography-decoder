# Steganography Decoder

## 📝 Description

Steganography Decoder is a web application that allows you to hide secret messages within PNG images and later extract them. Using steganography techniques, the application embeds your text directly into the image data in a way that is invisible to the naked eye, providing an additional layer of privacy beyond traditional encryption.

## ✨ Features

- 🔒 **Secure Message Encoding**: Hide text messages within PNG images
- 🔑 **Password Protection**: Add an extra layer of security with password-protected messages
- 📱 **Modern UI**: Clean and responsive interface built with React and Tailwind CSS
- 🔄 **Dual-mode Operation**: Switch between encryption and decryption modes
- 💾 **Easy Downloads**: Download your encoded images with a single click
- 🛡️ **Error Handling**: Robust error handling and user feedback
- 🌐 **Client-side Processing**: All encoding/decoding happens locally in your browser for privacy

## 🚀 Live Demo

Try it now: [Steganography Decoder](https://steganography-decoder.netlify.app/)

## 🛠️ Installation

To run this project locally:

```bash
# Clone the repository
git clone https://github.com/arnesethiago/steganography-decoder.git

# Navigate to project directory
cd steganography-decoder

# Install dependencies
npm install

# Start development server
npm start
```

Your app will be available at `http://localhost:3000`.

## 📖 How to Use

### Hiding a Message in an Image

1. Select "Encrypt" mode
2. Upload a PNG image using the file selector
3. Enter a password (remember this for later decryption)
4. Type the message you want to hide
5. Click "Encrypt" button
6. Download the resulting image once processing is complete

### Extracting a Hidden Message

1. Select "Decrypt" mode
2. Upload the image containing the hidden message
3. Enter the same password used during encryption
4. Click "Decrypt" button
5. The hidden message will appear below

## ⚙️ Technical Implementation

The application uses a custom steganography algorithm that stores message data in the red channel of image pixels. The process includes:

- Base64 encoding for data preparation
- Password verification during decoding
- Null terminator for message boundaries
- Adaptive decoding with substring analysis for error recovery
- Character limits to prevent infinite loops

## 🔍 Limitations

- Only supports PNG images due to their lossless compression
- Image size limits the amount of text that can be hidden
- Editing the image after encoding will likely corrupt the hidden message

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/arnesethiago/steganography-decoder/issues).

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

Project Link: [https://github.com/arnesethiago/steganography-decoder](https://github.com/arnesethiago/steganography-decoder)