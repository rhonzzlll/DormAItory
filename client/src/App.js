import { Route, Routes, Navigate } from "react-router-dom";
import Main from "./pages/Main";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import DormBot from "./pages/Dormbot"; // Correct import path to 'index.jsx'
import Payment from "./pages/Payment";
import MaintenanceRequest from "./pages/MaintenanceRequest";

function App() {
	const user = localStorage.getItem("token");

	return (
		<Routes>
			{/* Redirect to /login if user is not authenticated */}
			{user ? (
				<>
					<Route path="/" element={<Main />} />
					<Route path="/dormbot" element={<DormBot />} />
					<Route path="/payment" element={<Payment />} />
					<Route path="/maintenancerequest" element={<MaintenanceRequest />} />
				</>
			) : (
				<>
					<Route path="/signup" element={<Signup />} />
					<Route path="/login" element={<Login />} />
					<Route path="/" element={<Navigate replace to="/login" />} />
				</>
			)}
		</Routes>
	);
}

export default App;
