// ... (imports esistenti)

const IndexPage = () => {
  // ... (codice esistente)

  const handleForceLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Errore durante il logout:", error);
      toast.error("Errore durante il logout");
    } else {
      // Forza un refresh completo per pulire eventuali token residui
      window.location.href = '/login';
    }
  };

  return (
    // ... (codice esistente)
    <Button 
      onClick={handleForceLogout} 
      variant="ghost"
      className="text-red-600 hover:bg-red-50"
    >
      <LogOut className="mr-2 h-5 w-5" /> Logout Completo
    </Button>
    // ... (codice esistente)
  );
};