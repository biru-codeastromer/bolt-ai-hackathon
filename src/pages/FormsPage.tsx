import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { formsAPI } from '../services/api';
import { Form } from '../types';
import { ClipboardList, Plus } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { motion } from 'framer-motion';

const FormsPage: React.FC = () => {
  const [forms, setForms] = useState<Form[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchForms = async () => {
      try {
        setIsLoading(true);
        const response = await formsAPI.getForms();
        setForms(response.data.forms);
      } catch (error) {
        console.error('Error fetching forms:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchForms();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Forms & Applications</h1>
        <Button
          variant="primary"
          leftIcon={<Plus size={18} />}
          as={Link}
          to="/forms/new"
        >
          Create Form
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : forms.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {forms.map((form) => (
            <motion.div
              key={form.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Link
                to={`/forms/${form.id}`}
                className="block h-full bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow p-6"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{form.title}</h3>
                    {form.description && (
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {form.description}
                      </p>
                    )}
                    <p className="text-gray-500 text-xs">
                      {form.fields.length} {form.fields.length === 1 ? 'field' : 'fields'}
                      <span className="mx-2">•</span>
                      Created on {new Date(form.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="bg-indigo-50 rounded-lg p-2">
                    <ClipboardList className="h-5 w-5 text-indigo-600" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-indigo-100 mb-4">
            <ClipboardList className="h-6 w-6 text-indigo-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No forms yet</h3>
          <p className="text-gray-500 mb-6">Create your first form to get started</p>
          <Button 
            variant="primary"
            leftIcon={<Plus size={18} />}
            as={Link}
            to="/forms/new"
          >
            Create Form
          </Button>
        </div>
      )}
    </div>
  );
};

export default FormsPage;