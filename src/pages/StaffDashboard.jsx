
import { signOut } from "firebase/auth";
import { auth } from "../config/firebase";
import ManageActivities from "./ManageActivities";

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
            <ManageActivities />
        </div>
    )
}
export default StaffDashboard;

