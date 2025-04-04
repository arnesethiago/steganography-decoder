import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import JSZip from 'jszip';
import { motion } from 'framer-motion';

const encode = async (image, text, password) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.src = image;
    await new Promise(resolve => { img.onload = resolve });
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);

    const binaryText = btoa(password + text);
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = data.data;

    for (let i = 0; i < binaryText.length; i++) {
        pixels[i * 4] = binaryText.charCodeAt(i);
    }

    ctx.putImageData(data, 0, 0);
    return canvas.toDataURL('image/png');
};

const decode = async (image, password) => {
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

    let extracted = '';
    for (let i = 0; i < pixels.length; i += 4) {
        if (pixels[i] === 0) break;
        extracted += String.fromCharCode(pixels[i]);
    }

    const decoded = atob(extracted);
    if (decoded.startsWith(password)) {
        return decoded.slice(password.length);
    } else {
        throw new Error('Senha incorreta ou imagem inválida.');
    }
};

const SteganographyDecoder = () => {
    const [mode, setMode] = useState('encrypt');
    const [password, setPassword] = useState('');
    const [image, setImage] = useState(null);
    const [text, setText] = useState('');
    const [result, setResult] = useState('');
    const [error, setError] = useState(null);

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file && file.type === 'image/png') {
            const reader = new FileReader();
            reader.onload = () => setImage(reader.result);
            reader.readAsDataURL(file);
        } else {
            setError('Por favor, selecione uma imagem PNG válida.');
        }
    };

    const handleDownload = () => {
        const link = document.createElement('a');
        link.href = result;
        link.download = 'imagem_esteganografada.png';
        link.click();
    };

    return (
        <div className="p-6 max-w-4xl mx-auto bg-gray-100 rounded-2xl shadow-xl">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
                <header className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-blue-600">Steganography Decoder</h1>
                    <p className="text-gray-500 mt-2">Encripte e desencripte mensagens dentro de imagens PNG de forma segura</p>
                </header>

                <Card className="bg-white shadow-md rounded-2xl">
                    <CardContent className="p-6 space-y-6">
                        <div className="flex gap-4 mb-4 justify-center">
                            <Button onClick={() => setMode('encrypt')} className={mode === 'encrypt' ? 'bg-blue-500 text-white' : ''}>Encriptar</Button>
                            <Button onClick={() => setMode('decrypt')} className={mode === 'decrypt' ? 'bg-blue-500 text-white' : ''}>Desencriptar</Button>
                        </div>

                        <Input type="file" accept=".png" onChange={handleImageUpload} className="border rounded-xl p-2" />
                        <Input type="password" placeholder="Senha" value={password} onChange={e => setPassword(e.target.value)} className="border rounded-xl p-2 mt-4" />

                        {mode === 'encrypt' && (
                            <Textarea placeholder="Texto a ser encriptado" value={text} onChange={e => setText(e.target.value)} className="border rounded-xl p-2 mt-4" />
                        )}

                        <Button onClick={mode === 'encrypt' ? handleDownload : null} className="mt-4 bg-blue-500 text-white rounded-2xl p-2">
                            {mode === 'encrypt' ? 'Encriptar e Baixar Imagem' : 'Desencriptar'}
                        </Button>

                        {error && <div className="text-red-500 mt-4">{error}</div>}
                        {result && mode === 'decrypt' && <div className="mt-4 bg-gray-200 p-4 rounded-xl">Texto Desencriptado: {result}</div>}
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
};

export default SteganographyDecoder;
