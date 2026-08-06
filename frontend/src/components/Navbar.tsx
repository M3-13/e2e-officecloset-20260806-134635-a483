import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import styles from "./Navbar.module.css";

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <nav className={styles.navbar}>
      <NavLink to="/wardrobe" className={styles.logo}>
        Hollywood Closet
      </NavLink>

      <div className={styles.links}>
        <NavLink
          to="/wardrobe"
          className={({ isActive }) =>
            `${styles.link} ${isActive ? styles.active : ""}`
          }
        >
          Garderobe
        </NavLink>
        <NavLink
          to="/outfits"
          className={({ isActive }) =>
            `${styles.link} ${isActive ? styles.active : ""}`
          }
        >
          Outfits
        </NavLink>
        <NavLink
          to="/outfits/create"
          className={({ isActive }) =>
            `${styles.link} ${isActive ? styles.active : ""}`
          }
        >
          Outfit-Creator
        </NavLink>
      </div>

      <div className={styles.userArea}>
        {isAuthenticated && user ? (
          <>
            <span className={styles.userEmail}>{user.email}</span>
            <button
              className={styles.logoutButton}
              onClick={logout}
              type="button"
            >
              Logout
            </button>
          </>
        ) : (
          <NavLink
            to="/login"
            className={({ isActive }) =>
              `${styles.link} ${isActive ? styles.active : ""}`
            }
          >
            Login
          </NavLink>
        )}
      </div>
    </nav>
  );
}
