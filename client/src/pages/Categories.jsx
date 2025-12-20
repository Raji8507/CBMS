import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { categoriesAPI } from '../services/api';
import Tooltip from '../components/Tooltip/Tooltip';
import PageHeader from '../components/Common/PageHeader';
import StatCard from '../components/Common/StatCard';
import { Plus, Pencil, Trash2, Layers, CheckCircle, XCircle } from 'lucide-react';
import './Categories.css';

const Categories = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [stats, setStats] = useState({
        total: 0,
        active: 0,
        inactive: 0
    });

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const response = await categoriesAPI.getCategories();
            if (response.data.success) {
                const cats = response.data.data.categories;
                setCategories(cats);

                // Calculate stats
                setStats({
                    total: cats.length,
                    active: cats.filter(c => c.isActive).length,
                    inactive: cats.filter(c => !c.isActive).length
                });
            }
        } catch (err) {
            setError('Failed to fetch categories');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this category? Any budget heads using this category will need to be updated.')) {
            try {
                await categoriesAPI.deleteCategory(id);
                fetchCategories();
            } catch (err) {
                setError('Failed to delete category');
                console.error(err);
            }
        }
    };

    if (loading) {
        return (
            <div className="categories-container">
                <div className="loading-state">Loading categories...</div>
            </div>
        );
    }

    return (
        <div className="categories-container">
            <PageHeader
                title="Category Management"
                subtitle="Manage and organize budget head categories"
            >
                <Link to="/categories/add" className="btn btn-primary">
                    <Plus size={18} /> Add Category
                </Link>
            </PageHeader>

            <div className="stats-grid">
                <StatCard
                    title="Total Categories"
                    value={stats.total}
                    icon={<Layers size={24} />}
                    color="#1a237e"
                />
                <StatCard
                    title="Active"
                    value={stats.active}
                    icon={<CheckCircle size={24} />}
                    color="#2e7d32"
                />
                <StatCard
                    title="Inactive"
                    value={stats.inactive}
                    icon={<XCircle size={24} />}
                    color="#c62828"
                />
            </div>

            <div className="categories-card">
                <div className="table-responsive">
                    <table className="modern-table">
                        <thead>
                            <tr>
                                <th>Category Name</th>
                                <th>Code</th>
                                <th>Description</th>
                                <th>Status</th>
                                <th className="text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {categories.map((category) => (
                                <tr key={category.id}>
                                    <td>
                                        <div className="category-name-cell">
                                            <div
                                                className="color-preview"
                                                style={{ backgroundColor: category.color }}
                                            ></div>
                                            <span>{category.name}</span>
                                        </div>
                                    </td>
                                    <td><span className="code-badge">{category.code}</span></td>
                                    <td><span className="description-text">{category.description || 'N/A'}</span></td>
                                    <td>
                                        <span className={`status-badge ${category.isActive ? 'status-active' : 'status-inactive'}`}>
                                            {category.isActive ? 'ACTIVE' : 'INACTIVE'}
                                        </span>
                                    </td>
                                    <td className="text-right">
                                        <div className="action-buttons">
                                            <Tooltip text="Edit Category">
                                                <Link
                                                    to={`/categories/edit/${category.id}`}
                                                    className="btn btn-sm btn-secondary"
                                                >
                                                    <Pencil size={16} />
                                                </Link>
                                            </Tooltip>
                                            <Tooltip text="Delete Category">
                                                <button
                                                    onClick={() => handleDelete(category.id)}
                                                    className="btn btn-sm btn-danger"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </Tooltip>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Categories;
