import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

const IndexPage = () => {
  const navigate = useNavigate();

  return (
    <div 
      className="min-h-screen w-full bg-[url('/images/AULA-UNIVERSITA-IMAGOECONOMICA_359058-K7RD--1020X533@ILSLE24ORE-WEB.JPG')] bg-cover bg-center bg-fixed"
      style={{
        // Fallback visibile se l'immagine non carica
        backgroundColor: '#f0f0f0',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed'
      }}
    >
      <div className="bg-white/90 min-h-screen">
        <div className="container mx-auto p-6">
          <Card className="p-6">
            <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
            <Button onClick={() => navigate('/')}>Vai alla Home</Button>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default IndexPage;