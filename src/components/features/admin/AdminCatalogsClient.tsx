'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import { Plus, Layers, MonitorSmartphone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  createCatalogItem,
  toggleCatalogItemStatus,
} from '@/lib/admin/catalog-actions'
import { Badge } from '@/components/ui/badge'

interface CatalogItem {
  id?: string
  id_tecnologia?: string
  id_categoria?: string
  nombre: string
  is_active: boolean
}

interface AdminCatalogsClientProps {
  initialTecnologias: CatalogItem[]
  initialCategorias: CatalogItem[]
}

export function AdminCatalogsClient({
  initialTecnologias,
  initialCategorias,
}: AdminCatalogsClientProps) {
  const t = useTranslations('Admin')
  const tCommon = useTranslations('Common')
  const [activeTab, setActiveTab] = useState<'tecnologias' | 'categorias'>(
    'tecnologias',
  )
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [newName, setNewName] = useState('')
  const [loading, setLoading] = useState(false)

  const handleAddOpen = () => {
    setNewName('')
    setIsAddOpen(true)
  }

  const handleAddConfirm = async () => {
    if (newName.trim().length < 2) {
      toast.error(t('catalogNameMin'))
      return
    }
    setLoading(true)
    const result = await createCatalogItem(activeTab, newName.trim())
    setLoading(false)

    if (result.ok) {
      toast.success(t('catalogAddSuccess'))
      setIsAddOpen(false)
    } else {
      toast.error(t('catalogAddError', { error: result.error }))
    }
  }

  const handleToggle = async (
    id: string,
    currentStatus: boolean,
    type: 'tecnologias' | 'categorias',
  ) => {
    const result = await toggleCatalogItemStatus(type, id, !currentStatus)
    if (result.ok) {
      toast.success(t('catalogStatusUpdated'))
    } else {
      toast.error(t('catalogStatusError', { error: result.error }))
    }
  }

  const renderTable = (
    items: CatalogItem[],
    type: 'tecnologias' | 'categorias',
  ) => (
    <div className="rounded-xl border border-border bg-surface shadow-sm overflow-hidden mt-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('catalogColName')}</TableHead>
            <TableHead className="w-[150px]">{t('catalogColStatus')}</TableHead>
            <TableHead className="w-[100px] text-right">
              {t('catalogColToggle')}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => {
            const id =
              type === 'tecnologias' ? item.id_tecnologia! : item.id_categoria!
            return (
              <TableRow key={id}>
                <TableCell className="font-semibold">{item.nombre}</TableCell>
                <TableCell>
                  <Badge
                    variant={item.is_active ? 'default' : 'secondary'}
                    className={
                      item.is_active
                        ? 'bg-primary/10 text-primary border-primary/20'
                        : 'bg-muted text-muted-foreground'
                    }
                  >
                    {item.is_active ? t('catalogActive') : t('catalogHidden')}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant={item.is_active ? 'outline' : 'default'}
                    size="sm"
                    onClick={() => handleToggle(id, item.is_active, type)}
                  >
                    {item.is_active
                      ? t('catalogDeactivate')
                      : t('catalogActivate')}
                  </Button>
                </TableCell>
              </TableRow>
            )
          })}
          {items.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={3}
                className="h-24 text-center text-muted-foreground"
              >
                {t('catalogEmpty')}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold">{t('catalogTitle')}</h2>
        <Button onClick={handleAddOpen} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          {t('catalogAddNew')}
        </Button>
      </div>

      <Tabs
        value={activeTab}
        defaultValue="tecnologias"
        onValueChange={(v) => setActiveTab(v as 'tecnologias' | 'categorias')}
      >
        <TabsList
          label={t('catalogTabsLabel')}
          className="grid w-full grid-cols-2 md:w-[400px]"
        >
          <TabsTrigger value="tecnologias" className="flex items-center gap-2">
            <MonitorSmartphone className="h-4 w-4" /> {t('catalogTechnologies')}
          </TabsTrigger>
          <TabsTrigger value="categorias" className="flex items-center gap-2">
            <Layers className="h-4 w-4" /> {t('catalogCategories')}
          </TabsTrigger>
        </TabsList>
        <TabsContent value="tecnologias">
          {renderTable(initialTecnologias, 'tecnologias')}
        </TabsContent>
        <TabsContent value="categorias">
          {renderTable(initialCategorias, 'categorias')}
        </TabsContent>
      </Tabs>

      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {t('catalogAddDialogTitle', {
                tipo:
                  activeTab === 'tecnologias'
                    ? t('catalogTechnologies')
                    : t('catalogCategories'),
              })}
            </DialogTitle>
            <DialogDescription>{t('catalogAddDialogDesc')}</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder={t('catalogNamePlaceholder')}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAddConfirm()
              }}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAddOpen(false)}
              disabled={loading}
            >
              {tCommon('cancel')}
            </Button>
            <Button
              onClick={handleAddConfirm}
              disabled={loading || newName.trim().length < 2}
            >
              {t('catalogSave')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
