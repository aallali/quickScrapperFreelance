import React from "react";

import { Navigate } from "react-router-dom";

// const ProtectedRoute = ({ children, ...rest }) => {
//     const navigate = useNavigate()
//   return (
//     <Route
//       {...rest}
//       render={({ location }) =>
//         localStorage.getItem("token") ? (
//           children
//         ) : (
//             navigate("/")
//         )
//       }
//     />
//   );
// };

const ProtectedRoute = ({ children, redirectTo }) => {
  let isAuthenticated = !!localStorage.getItem("token");
  return isAuthenticated ? children : <Navigate to={redirectTo} />;
};
export default ProtectedRoute;
