// ... (codice esistente)

<Button 
  onClick={() => navigate('/')} 
  className="bg-yellow-400 hover:bg-yellow-500 text-black"
  disabled={location.pathname === '/'} // Disabilita il pulsante se già sulla dashboard
>
  <Clock className="mr-2 h-5 w-5" /> Dashboard
</Button>

// ... (resto del codice)