/*
========================
SECTION: MODULE OVERVIEW
========================
*/

import { supabase } from "../../services/supabase";
import { useNavigate } from "react-router-dom";
import useToast from "../../hooks/useToast";
import Button from "../UI/Button";

function LogoutButton() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      showToast(`Logout failed: ${error.message}`, "error");
      return;
    }
    navigate("/login");
  };

  return (
    <Button 
      variant="ghost" 
      size="sm"
      className="text-gray-600 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 dark:hover:bg-red-900/20 px-2 sm:px-3"
      onClick={handleLogout}
      icon={(props) => (
        <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
      )}
    >
      <span className="hidden sm:inline">Logout</span>
    </Button>
  );
}

export default LogoutButton;

