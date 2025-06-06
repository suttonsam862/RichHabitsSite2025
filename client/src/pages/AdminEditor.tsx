import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Edit3, Save, Eye } from 'lucide-react';
import { Link } from 'wouter';

export default function AdminEditor() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <Link href="/admin">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Storefront Editor</h1>
                <p className="text-gray-600">Edit content and customize your storefront</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="secondary">Admin</Badge>
              <Button>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        >
          {/* Editor Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Editor Tools</CardTitle>
                <CardDescription>
                  Customize your storefront content
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button variant="outline" className="w-full justify-start">
                  <Edit3 className="w-4 h-4 mr-2" />
                  Edit Homepage
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Edit3 className="w-4 h-4 mr-2" />
                  Manage Events
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Edit3 className="w-4 h-4 mr-2" />
                  Edit About Page
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Edit3 className="w-4 h-4 mr-2" />
                  Customize Layout
                </Button>
                <div className="pt-4 border-t">
                  <Button className="w-full justify-start">
                    <Eye className="w-4 h-4 mr-2" />
                    Preview Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Editor Main Area */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Content Editor</CardTitle>
                <CardDescription>
                  Full storefront editing tools will be available here
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Edit3 className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Storefront Editor Coming Soon
                  </h3>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    This area will contain comprehensive tools for editing your storefront content, 
                    managing products, customizing layouts, and more.
                  </p>
                  <div className="text-sm text-gray-500">
                    Current admin: {user?.email}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </div>
    </div>
  );
}