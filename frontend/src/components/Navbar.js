import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { FaUserCircle, FaHome, FaBook, FaChalkboard, FaSearch, FaTimes, FaUserPlus, FaClipboardList } from 'react-icons/fa';
import "../home.css";
import LoadingLink from './LoadingLink';
import { useLoading } from '../context/LoadingContext';

const Navbar = (props) => {
    const location = useLocation();
    const { setIsPageLoading } = useLoading();
    let pageTitle;

    // React useState weather to show the password
    const [showPassword, setShowPassword] = useState("0");

    // Handling user to logout and gets redirect user to login
    const logoutHandler = () => {
        setIsPageLoading(true);
        localStorage.clear();
        window.location.href = "/login";
    };

    useEffect(() => {
        setShowPassword(localStorage.getItem("change") ?? "0");
    }, []);

    // Function to check if the current path matches a dynamic route pattern
    const isDynamicRoute = (routePattern) => {
        const regex = new RegExp(routePattern);
        return regex.test(location.pathname);
    };

    // Determine the page title based on the current path
    if (isDynamicRoute("^/class/.+/addstudent$")) {
        pageTitle = "Create Student Profile";
    } else if (isDynamicRoute("^/class/.+/.+$")) {
        pageTitle = "Student Profile";
    } else if (isDynamicRoute("^/class/.+$")) {
        pageTitle = "Class Management";
    } else {
        switch (location.pathname) {
            case "/home":
                pageTitle = "";
                break;
            case "/stories":
                pageTitle = "Stories";
                break;
            case "/class":
                pageTitle = "Create a New Class";
                break;
            case "/search":
                pageTitle = "Search Stories";
                break;
            case "/createstory":
                pageTitle = "Create a New Story";
                break;
            case "/pending":
                pageTitle = "Pending Stories";
                break;
            case "/manage_accounts":
                pageTitle = "Manage Accounts";
                break;
            case "/invite_family":
                pageTitle = "Invite Family";
                break;
            case "/invite_parent":
                pageTitle = "Invite Parent";
                break;
            case "/assessments":
                pageTitle = "Assessments";
                break;
            // other static routes
            default:
                pageTitle = "Goldfields School"; // Fallback title
        }
    }

    const isActive = (path) => {
        return location.pathname === path ? "nav-item active" : "nav-item";
    };

    if (showPassword == "0") {
        return (
            <header>
                <nav className="navbar">
                    {/* Display the determined page title */}
                    <LoadingLink to="/home" className="nav-logo">
                        <h1 className="nav-h1">{pageTitle}</h1>
                    </LoadingLink>
                    <div className="nav-links">
                        <LoadingLink to="/home" className={isActive("/home")}>
                            <FaHome className="nav-icon" /> Home
                        </LoadingLink>
                        {
                            ["Admin", "Teacher", "Parent", "Family"].includes(props?.role) &&
                            <LoadingLink to="/stories" className={isActive("/stories")}>
                                <FaBook className="nav-icon" /> Stories
                            </LoadingLink>
                        }
                        {
                            ["Admin", "Teacher"].includes(props?.role) &&
                            <>
                                <LoadingLink to="/class" className={isActive("/class")}>
                                    <FaChalkboard className="nav-icon" /> Classes
                                </LoadingLink>
                                <LoadingLink to="/search" className={isActive("/search")}>
                                    <FaSearch className="nav-icon" /> Search Stories
                                </LoadingLink>
                                <LoadingLink to="/assessments" className={isActive("/assessments")}>
                                    <FaClipboardList className="nav-icon" /> Assessments
                                </LoadingLink>
                            </>
                        }
                        {
                            ["Admin"].includes(props?.role) &&
                            <LoadingLink to="/manage_accounts" className={isActive("/manage_accounts")}>
                                <FaUserCircle className="nav-icon" /> Manage Accounts
                            </LoadingLink>
                        }
                        {
                            ["Admin"].includes(props?.role) &&
                            <>
                                <LoadingLink to="/invite_parent" className={isActive("/invite_parent")}>
                                    <FaUserPlus className="nav-icon" /> Invite Parent
                                </LoadingLink>
                            </>
                        }
                        {
                            ["Family"].includes(props?.role) &&
                            <>
                                <LoadingLink to="/search" className={isActive("/search")}>
                                    <FaSearch className="nav-icon" /> Search Stories
                                </LoadingLink>
                            </>
                        }
                        {
                            ["Parent"].includes(props?.role) &&
                            <>
                                <LoadingLink to="/invite_family" className={isActive("/invite_family")}>
                                    <FaUserPlus className="nav-icon" /> Invite Family
                                </LoadingLink>
                                <LoadingLink to="/search" className={isActive("/search")}>
                                    <FaSearch className="nav-icon" /> Search Stories
                                </LoadingLink>
                            </>
                        }
                        <LoadingLink to="/logout" onClick={logoutHandler} className="nav-item">
                            <FaTimes className="nav-icon" /> Logout
                        </LoadingLink>
                    </div>
                </nav>
            </header>
        );
    } else if (showPassword == "1") {
        return (
            <header>
                <nav className="navbar">
                    <LoadingLink to="/home" className="nav-logo">
                        <h1 className="nav-h1">{pageTitle}</h1>
                    </LoadingLink>
                    <div className="nav-links">
                        <LoadingLink to="/home" className={isActive("/home")}>
                            <FaHome className="nav-icon" /> Home
                        </LoadingLink>
                        <LoadingLink to="/logout" onClick={logoutHandler} className="nav-item">
                            <FaTimes className="nav-icon" /> Logout
                        </LoadingLink>
                    </div>
                </nav>
            </header>
        );
    }
};

export default Navbar;