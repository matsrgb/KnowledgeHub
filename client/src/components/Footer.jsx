import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import categoryService from "../services/categoryService";

const Footer = () => {
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const data = await categoryService.getCategories();
                setCategories(data);
            } catch (error) {
                console.error("Failed to fetch categories", error);
            }
        };

        fetchCategories();
    }, []);

    return (
        <footer>
            <ul className="footer__categories">
                {categories.map(category => (
                    <li key={category._id}>
                        <Link to={`/posts/categories/${category.name}`}>
                            {category.name}
                        </Link>
                    </li>
                ))}
            </ul>
            <div className="footer__copyright">
                <small>All Rights Reserved &copy; Knowledge Hub</small>
            </div>
        </footer>
    );
};

export default Footer;
