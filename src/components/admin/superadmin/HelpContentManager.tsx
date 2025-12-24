import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { 
  FolderOpen, 
  FileText, 
  HelpCircle, 
  Plus, 
  Pencil, 
  Trash2,
  Book,
  Home,
  Calendar,
  CreditCard,
  Globe,
  Users,
  Loader2,
} from 'lucide-react';
import {
  useHelpCategories,
  useHelpArticles,
  useHelpFAQs,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
  useCreateArticle,
  useUpdateArticle,
  useDeleteArticle,
  useCreateFAQ,
  useUpdateFAQ,
  useDeleteFAQ,
  HelpCategory,
  HelpArticle,
  HelpFAQ,
} from '@/hooks/useHelpContent';

const ICON_OPTIONS = [
  { value: 'Book', label: 'Book', icon: Book },
  { value: 'Home', label: 'Home', icon: Home },
  { value: 'Calendar', label: 'Calendar', icon: Calendar },
  { value: 'CreditCard', label: 'Credit Card', icon: CreditCard },
  { value: 'Globe', label: 'Globe', icon: Globe },
  { value: 'Users', label: 'Users', icon: Users },
  { value: 'HelpCircle', label: 'Help Circle', icon: HelpCircle },
  { value: 'FileText', label: 'File Text', icon: FileText },
];

const COLOR_OPTIONS = [
  { value: 'bg-blue-500', label: 'Blue' },
  { value: 'bg-green-500', label: 'Green' },
  { value: 'bg-purple-500', label: 'Purple' },
  { value: 'bg-yellow-500', label: 'Yellow' },
  { value: 'bg-pink-500', label: 'Pink' },
  { value: 'bg-indigo-500', label: 'Indigo' },
  { value: 'bg-red-500', label: 'Red' },
  { value: 'bg-orange-500', label: 'Orange' },
];

const HelpContentManager: React.FC = () => {
  const { data: categories, isLoading: loadingCategories } = useHelpCategories();
  const { data: articles, isLoading: loadingArticles } = useHelpArticles();
  const { data: faqs, isLoading: loadingFAQs } = useHelpFAQs();

  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();
  const createArticle = useCreateArticle();
  const updateArticle = useUpdateArticle();
  const deleteArticle = useDeleteArticle();
  const createFAQ = useCreateFAQ();
  const updateFAQ = useUpdateFAQ();
  const deleteFAQ = useDeleteFAQ();

  // Category state
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<HelpCategory | null>(null);
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    slug: '',
    description: '',
    icon: 'HelpCircle',
    color: 'bg-blue-500',
    is_active: true,
    sort_order: 0,
  });

  // Article state
  const [articleDialogOpen, setArticleDialogOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<HelpArticle | null>(null);
  const [articleForm, setArticleForm] = useState({
    title: '',
    content: '',
    category_id: '',
    article_type: 'guide' as HelpArticle['article_type'],
    is_published: true,
    sort_order: 0,
  });

  // FAQ state
  const [faqDialogOpen, setFaqDialogOpen] = useState(false);
  const [editingFAQ, setEditingFAQ] = useState<HelpFAQ | null>(null);
  const [faqForm, setFaqForm] = useState({
    question: '',
    answer: '',
    category_id: '',
    audience: 'owner' as HelpFAQ['audience'],
    is_published: true,
    sort_order: 0,
  });

  // Category handlers
  const openCategoryDialog = (category?: HelpCategory) => {
    if (category) {
      setEditingCategory(category);
      setCategoryForm({
        name: category.name,
        slug: category.slug,
        description: category.description || '',
        icon: category.icon,
        color: category.color,
        is_active: category.is_active,
        sort_order: category.sort_order,
      });
    } else {
      setEditingCategory(null);
      setCategoryForm({
        name: '',
        slug: '',
        description: '',
        icon: 'HelpCircle',
        color: 'bg-blue-500',
        is_active: true,
        sort_order: (categories?.length || 0) + 1,
      });
    }
    setCategoryDialogOpen(true);
  };

  const handleCategorySave = async () => {
    if (editingCategory) {
      await updateCategory.mutateAsync({ id: editingCategory.id, ...categoryForm });
    } else {
      await createCategory.mutateAsync(categoryForm);
    }
    setCategoryDialogOpen(false);
  };

  // Article handlers
  const openArticleDialog = (article?: HelpArticle) => {
    if (article) {
      setEditingArticle(article);
      setArticleForm({
        title: article.title,
        content: article.content,
        category_id: article.category_id || '',
        article_type: article.article_type,
        is_published: article.is_published,
        sort_order: article.sort_order,
      });
    } else {
      setEditingArticle(null);
      setArticleForm({
        title: '',
        content: '',
        category_id: '',
        article_type: 'guide',
        is_published: true,
        sort_order: (articles?.length || 0) + 1,
      });
    }
    setArticleDialogOpen(true);
  };

  const handleArticleSave = async () => {
    const payload = {
      ...articleForm,
      category_id: articleForm.category_id || null,
    };
    if (editingArticle) {
      await updateArticle.mutateAsync({ id: editingArticle.id, ...payload });
    } else {
      await createArticle.mutateAsync(payload);
    }
    setArticleDialogOpen(false);
  };

  // FAQ handlers
  const openFAQDialog = (faq?: HelpFAQ) => {
    if (faq) {
      setEditingFAQ(faq);
      setFaqForm({
        question: faq.question,
        answer: faq.answer,
        category_id: faq.category_id || '',
        audience: faq.audience,
        is_published: faq.is_published,
        sort_order: faq.sort_order,
      });
    } else {
      setEditingFAQ(null);
      setFaqForm({
        question: '',
        answer: '',
        category_id: '',
        audience: 'owner',
        is_published: true,
        sort_order: (faqs?.length || 0) + 1,
      });
    }
    setFaqDialogOpen(true);
  };

  const handleFAQSave = async () => {
    const payload = {
      ...faqForm,
      category_id: faqForm.category_id || null,
    };
    if (editingFAQ) {
      await updateFAQ.mutateAsync({ id: editingFAQ.id, ...payload });
    } else {
      await createFAQ.mutateAsync(payload);
    }
    setFaqDialogOpen(false);
  };

  const getIconComponent = (iconName: string) => {
    const iconOption = ICON_OPTIONS.find(opt => opt.value === iconName);
    return iconOption?.icon || HelpCircle;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <HelpCircle className="h-5 w-5" />
          Help Center Content
        </CardTitle>
        <CardDescription>
          Manage categories, articles, and FAQs for the help center
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="categories">
          <TabsList>
            <TabsTrigger value="categories" className="flex items-center gap-2">
              <FolderOpen className="h-4 w-4" />
              Categories ({categories?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="articles" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Articles ({articles?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="faqs" className="flex items-center gap-2">
              <HelpCircle className="h-4 w-4" />
              FAQs ({faqs?.length || 0})
            </TabsTrigger>
          </TabsList>

          {/* Categories Tab */}
          <TabsContent value="categories" className="mt-4 space-y-4">
            <div className="flex justify-end">
              <Button onClick={() => openCategoryDialog()}>
                <Plus className="h-4 w-4 mr-2" />
                Add Category
              </Button>
            </div>

            {loadingCategories ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : (
              <div className="space-y-2">
                {categories?.map((category) => {
                  const IconComponent = getIconComponent(category.icon);
                  return (
                    <div
                      key={category.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full ${category.color} flex items-center justify-center`}>
                          <IconComponent className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{category.name}</span>
                            <Badge variant="outline">{category.slug}</Badge>
                            {!category.is_active && (
                              <Badge variant="secondary">Inactive</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {category.description || 'No description'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openCategoryDialog(category)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Category?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will delete the category and all associated articles. This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteCategory.mutate(category.id)}
                                className="bg-destructive text-destructive-foreground"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  );
                })}
                {categories?.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    No categories yet. Create one to get started.
                  </p>
                )}
              </div>
            )}
          </TabsContent>

          {/* Articles Tab */}
          <TabsContent value="articles" className="mt-4 space-y-4">
            <div className="flex justify-end">
              <Button onClick={() => openArticleDialog()}>
                <Plus className="h-4 w-4 mr-2" />
                Add Article
              </Button>
            </div>

            {loadingArticles ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : (
              <div className="space-y-2">
                {articles?.map((article) => (
                  <div
                    key={article.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{article.title}</span>
                        <Badge variant="outline">{article.article_type}</Badge>
                        {!article.is_published && (
                          <Badge variant="secondary">Draft</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {article.content.substring(0, 100)}...
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openArticleDialog(article)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Article?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently delete this article. This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteArticle.mutate(article.id)}
                              className="bg-destructive text-destructive-foreground"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                ))}
                {articles?.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    No articles yet. Create one to get started.
                  </p>
                )}
              </div>
            )}
          </TabsContent>

          {/* FAQs Tab */}
          <TabsContent value="faqs" className="mt-4 space-y-4">
            <div className="flex justify-end">
              <Button onClick={() => openFAQDialog()}>
                <Plus className="h-4 w-4 mr-2" />
                Add FAQ
              </Button>
            </div>

            {loadingFAQs ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : (
              <div className="space-y-2">
                {faqs?.map((faq) => (
                  <div
                    key={faq.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{faq.question}</span>
                        <Badge variant={faq.audience === 'owner' ? 'default' : faq.audience === 'guest' ? 'secondary' : 'outline'}>
                          {faq.audience}
                        </Badge>
                        {!faq.is_published && (
                          <Badge variant="secondary">Draft</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {faq.answer.substring(0, 100)}...
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openFAQDialog(faq)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete FAQ?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently delete this FAQ. This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteFAQ.mutate(faq.id)}
                              className="bg-destructive text-destructive-foreground"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                ))}
                {faqs?.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    No FAQs yet. Create one to get started.
                  </p>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Category Dialog */}
        <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingCategory ? 'Edit Category' : 'Add Category'}
              </DialogTitle>
              <DialogDescription>
                {editingCategory ? 'Update the category details' : 'Create a new help category'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm(prev => ({
                    ...prev,
                    name: e.target.value,
                    slug: e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
                  }))}
                  placeholder="Getting Started"
                />
              </div>
              <div className="space-y-2">
                <Label>Slug</Label>
                <Input
                  value={categoryForm.slug}
                  onChange={(e) => setCategoryForm(prev => ({ ...prev, slug: e.target.value }))}
                  placeholder="getting-started"
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Input
                  value={categoryForm.description}
                  onChange={(e) => setCategoryForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Learn the basics..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Icon</Label>
                  <Select
                    value={categoryForm.icon}
                    onValueChange={(value) => setCategoryForm(prev => ({ ...prev, icon: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ICON_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <span className="flex items-center gap-2">
                            <option.icon className="h-4 w-4" />
                            {option.label}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Color</Label>
                  <Select
                    value={categoryForm.color}
                    onValueChange={(value) => setCategoryForm(prev => ({ ...prev, color: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {COLOR_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <span className="flex items-center gap-2">
                            <span className={`w-4 h-4 rounded ${option.value}`} />
                            {option.label}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={categoryForm.is_active}
                  onCheckedChange={(checked) => setCategoryForm(prev => ({ ...prev, is_active: checked }))}
                />
                <Label>Active</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCategoryDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCategorySave} disabled={createCategory.isPending || updateCategory.isPending}>
                {(createCategory.isPending || updateCategory.isPending) && (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                )}
                {editingCategory ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Article Dialog */}
        <Dialog open={articleDialogOpen} onOpenChange={setArticleDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingArticle ? 'Edit Article' : 'Add Article'}
              </DialogTitle>
              <DialogDescription>
                {editingArticle ? 'Update the article content' : 'Create a new help article'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input
                  value={articleForm.title}
                  onChange={(e) => setArticleForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="How to do something..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select
                    value={articleForm.category_id}
                    onValueChange={(value) => setArticleForm(prev => ({ ...prev, category_id: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories?.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Article Type</Label>
                  <Select
                    value={articleForm.article_type}
                    onValueChange={(value: HelpArticle['article_type']) => setArticleForm(prev => ({ ...prev, article_type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="getting_started">Getting Started</SelectItem>
                      <SelectItem value="guide">Guide</SelectItem>
                      <SelectItem value="troubleshooting">Troubleshooting</SelectItem>
                      <SelectItem value="faq">FAQ</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Content</Label>
                <Textarea
                  value={articleForm.content}
                  onChange={(e) => setArticleForm(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Write your article content here..."
                  rows={8}
                />
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={articleForm.is_published}
                  onCheckedChange={(checked) => setArticleForm(prev => ({ ...prev, is_published: checked }))}
                />
                <Label>Published</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setArticleDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleArticleSave} disabled={createArticle.isPending || updateArticle.isPending}>
                {(createArticle.isPending || updateArticle.isPending) && (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                )}
                {editingArticle ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* FAQ Dialog */}
        <Dialog open={faqDialogOpen} onOpenChange={setFaqDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingFAQ ? 'Edit FAQ' : 'Add FAQ'}
              </DialogTitle>
              <DialogDescription>
                {editingFAQ ? 'Update the FAQ' : 'Create a new FAQ'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Question</Label>
                <Input
                  value={faqForm.question}
                  onChange={(e) => setFaqForm(prev => ({ ...prev, question: e.target.value }))}
                  placeholder="How do I...?"
                />
              </div>
              <div className="space-y-2">
                <Label>Answer</Label>
                <Textarea
                  value={faqForm.answer}
                  onChange={(e) => setFaqForm(prev => ({ ...prev, answer: e.target.value }))}
                  placeholder="To do this, you need to..."
                  rows={4}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Category (optional)</Label>
                  <Select
                    value={faqForm.category_id}
                    onValueChange={(value) => setFaqForm(prev => ({ ...prev, category_id: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories?.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Audience</Label>
                  <Select
                    value={faqForm.audience}
                    onValueChange={(value: HelpFAQ['audience']) => setFaqForm(prev => ({ ...prev, audience: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="owner">Owner</SelectItem>
                      <SelectItem value="guest">Guest</SelectItem>
                      <SelectItem value="both">Both</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={faqForm.is_published}
                  onCheckedChange={(checked) => setFaqForm(prev => ({ ...prev, is_published: checked }))}
                />
                <Label>Published</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setFaqDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleFAQSave} disabled={createFAQ.isPending || updateFAQ.isPending}>
                {(createFAQ.isPending || updateFAQ.isPending) && (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                )}
                {editingFAQ ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default HelpContentManager;
