import React, { useState } from 'react';
import { motion } from 'framer-motion';

const encode = async (image, text, password) => {
    try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        img.src = image;
        await new Promise(resolve => { img.onload = resolve });
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        // Verificar se a imagem tem capacidade suficiente
        const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const pixels = data.data;
        const maxChars = Math.floor(pixels.length / 4);
        
        // Adicionar a senha e um terminador especial ao texto
        const textToHide = password + text + "\u0000"; // Adicionar um caractere nulo como terminador
        const binaryText = btoa(textToHide);
        
        if (binaryText.length > maxChars) {
            throw new Error(`The image is too small to store this message. Maximum: ${maxChars-5} characters.`);
        }

        // Armazenar a mensagem na imagem
        for (let i = 0; i < binaryText.length; i++) {
            pixels[i * 4] = binaryText.charCodeAt(i);
        }
        
        // Definir um marcador de fim explícito (zero)
        if (binaryText.length < maxChars) {
            pixels[binaryText.length * 4] = 0;
        }

        ctx.putImageData(data, 0, 0);
        return canvas.toDataURL('image/png');
    } catch (error) {
        console.error("Erro na codificação:", error);
        throw error;
    }
};

const decode = async (image, password) => {
    try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        img.src = image;
        await new Promise(resolve => { img.onload = resolve });
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const pixels = data.data;

        // Coletar caracteres até encontrar um byte nulo ou atingir o limite
        let extracted = '';
        const MAX_CHARS = Math.min(10000, pixels.length / 4); // Limite de segurança
        
        for (let i = 0; i < pixels.length && i/4 < MAX_CHARS; i += 4) {
            // Verificar o valor no canal vermelho (R)
            if (pixels[i] === 0) break;
            extracted += String.fromCharCode(pixels[i]);
        }
        
        console.log("Caracteres extraídos:", extracted.length);
        
        // Verificar se temos dados base64 válidos
        if (!extracted || extracted.length === 0) {
            throw new Error('No data found in the image.');
        }
        
        // Tentativa de decodificar diretamente o conteúdo completo
        try {
            const decoded = window.atob(extracted);
            // Verificar se a string decodificada contém a senha
            if (decoded.startsWith(password)) {
                // Remover a senha e qualquer caractere nulo no final
                const messageWithNulls = decoded.slice(password.length);
                // Remover caracteres nulos no final (se houver)
                return messageWithNulls.split('\u0000')[0];
            } else {
                throw new Error('Incorrect password.');
            }
        } catch (e) {
            console.error("Erro na decodificação base64:", e);
            
            // Tentativa alternativa: encontrar o maior prefixo válido
            for (let len = extracted.length; len >= 4; len -= 1) {
                try {
                    const subset = extracted.substring(0, len);
                    const decoded = window.atob(subset);
                    
                    if (decoded.startsWith(password)) {
                        const messageWithNulls = decoded.slice(password.length);
                        return messageWithNulls.split('\u0000')[0];
                    }
                } catch (innerError) {
                    // Continuar tentando com uma substring menor
                }
            }
            
            throw new Error('Could not decode the data. The image may be corrupted or does not contain a valid message.');
        }
    } catch (error) {
        console.error('Erro na decodificação:', error);
        throw error;
    }
};

const SteganographyDecoder = () => {
    const [mode, setMode] = useState('encrypt');
    const [password, setPassword] = useState('');
    const [image, setImage] = useState(null);
    const [text, setText] = useState('');
    const [result, setResult] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleImageUpload = (e) => {
        setError(null);
        const file = e.target.files[0];
        if (file && file.type === 'image/png') {
            const reader = new FileReader();
            reader.onload = () => setImage(reader.result);
            reader.readAsDataURL(file);
        } else {
            setError('Please select a valid PNG image.');
        }
    };

    const handleEncrypt = async () => {
        setError(null);
        setLoading(true);
        try {
            if (!image) {
                throw new Error('Please select an image.');
            }
            if (!password) {
                throw new Error('Please set a password.');
            }
            if (!text) {
                throw new Error('Please enter a text to encrypt.');
            }
            
            const encryptedImage = await encode(image, text, password);
            setResult(encryptedImage);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDecrypt = async () => {
        setError(null);
        setLoading(true);
        try {
            if (!image) {
                throw new Error('Please select an image.');
            }
            if (!password) {
                throw new Error('Please enter the password.');
            }
            
            const decryptedText = await decode(image, password);
            setResult(decryptedText);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = () => {
        if (!result) {
            setError('No encrypted image available for download.');
            return;
        }
        const link = document.createElement('a');
        link.href = result;
        link.download = 'steganography_image.png';
        link.click();
    };

    return (
        <div className="p-6 max-w-4xl mx-auto bg-gray-100 rounded-2xl shadow-xl">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
                <header className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-blue-600">Steganography Decoder</h1>
                    <p className="text-gray-500 mt-2">Encrypt and decrypt messages securely within PNG images</p>
                </header>

                <div className="bg-white shadow-md rounded-2xl p-6 space-y-6">
                    <div className="flex gap-4 mb-4 justify-center">
                        <button onClick={() => { setMode('encrypt'); setResult(''); setError(null); }} 
                                className={`px-4 py-2 rounded-xl ${mode === 'encrypt' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>
                            Encrypt
                        </button>
                        <button onClick={() => { setMode('decrypt'); setResult(''); setError(null); }} 
                                className={`px-4 py-2 rounded-xl ${mode === 'decrypt' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>
                            Decrypt
                        </button>
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-1">Select a PNG image:</label>
                        <input type="file" accept=".png" onChange={handleImageUpload} className="w-full border rounded-xl p-2" />
                    </div>
                    
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-1">Password:</label>
                        <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} 
                               className="w-full border rounded-xl p-2" />
                    </div>

                    {mode === 'encrypt' && (
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-1">Text to encrypt:</label>
                            <textarea placeholder="Text to encrypt" value={text} onChange={e => setText(e.target.value)} 
                                      className="w-full border rounded-xl p-2 min-h-[100px]" />
                        </div>
                    )}

                    {image && (
                        <div className="mb-4">
                            <p className="text-sm text-gray-600 mb-2">Selected image:</p>
                            <img src={image} alt="Preview" className="max-w-full h-auto max-h-[200px] rounded-lg border" />
                        </div>
                    )}

                    <button onClick={mode === 'encrypt' ? handleEncrypt : handleDecrypt} disabled={loading}
                            className="w-full mt-4 bg-blue-500 text-white rounded-2xl p-3 hover:bg-blue-600 transition-colors disabled:bg-blue-300">
                        {loading ? 'Processing...' : mode === 'encrypt' ? 'Encrypt' : 'Decrypt'}
                    </button>

                    {result && mode === 'encrypt' && (
                        <div className="mt-4">
                            <p className="text-sm text-gray-600 mb-2">Encrypted image:</p>
                            <img src={result} alt="Encrypted" className="max-w-full h-auto max-h-[200px] rounded-lg border mb-3" />
                            <button onClick={handleDownload} className="w-full bg-green-500 text-white rounded-2xl p-2 hover:bg-green-600 transition-colors">
                                Download Image
                            </button>
                        </div>
                    )}

                    {error && <div className="text-red-500 mt-4 p-3 bg-red-50 rounded-lg border border-red-200">{error}</div>}
                    {result && mode === 'decrypt' && (
                        <div className="mt-4 bg-green-50 p-4 rounded-xl border border-green-200">
                            <h3 className="font-medium text-green-800 mb-2">Decrypted Text:</h3>
                            <p className="text-gray-800">{result}</p>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default SteganographyDecoder;
