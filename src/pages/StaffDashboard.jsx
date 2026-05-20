
import { signOut } from "firebase/auth";
import { auth } from "../config/firebase";

function StaffDashboard ( { onLogout } ) {
    async function handleLogout () {
    await signOut(auth);
    onLogout();
    console.log("logout clicked");
    }
    return (
        <div>
            <h1>Welcome Staff</h1>
            <button onClick = {handleLogout}>
                 Logout
            </button>
        </div>
    )
}
export default StaffDashboard;

