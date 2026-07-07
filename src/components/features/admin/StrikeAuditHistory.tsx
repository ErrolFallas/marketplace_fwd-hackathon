import { listStrikeAudit } from '@/lib/admin/queries'
import { EmptyState } from '@/components/features/shared/EmptyState'
import { ShieldAlert, CheckCircle2, RotateCcw } from 'lucide-react'
import { getTranslations, getLocale } from 'next-intl/server'

export async function StrikeAuditHistory() {
  const t = await getTranslations('Admin')
  const locale = await getLocale()
  const result = await listStrikeAudit(100)
  const logs = result.ok ? result.data : []

  if (logs.length === 0) {
    return (
      <EmptyState
        title={t('strikeAuditEmptyTitle')}
        description={t('strikeAuditEmptyDesc')}
        icon={ShieldAlert}
      />
    )
  }

  return (
    <div className="rounded-2xl border border-border bg-surface shadow-sm overflow-hidden">
      {/* Header */}
      <div className="border-b border-border px-5 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {t('strikeAuditTitle', { count: logs.length })}
      </div>

      <div className="divide-y divide-border">
        {logs.map((log) => (
          <div
            key={log.id_strike}
            className="px-5 py-4 hover:bg-muted/60 transition-colors"
          >
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              {/* Left: user + action badge */}
              <div className="flex items-start gap-3">
                {/* Icon */}
                <div
                  className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                    log.revocado
                      ? 'bg-success/10 text-success'
                      : 'bg-warning/10 text-warning'
                  }`}
                >
                  {log.revocado ? (
                    <RotateCcw className="h-4 w-4" />
                  ) : (
                    <ShieldAlert className="h-4 w-4" />
                  )}
                </div>

                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-foreground">
                      {log.nombre_usuario}
                    </span>
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                        log.revocado
                          ? 'bg-success/10 text-success border border-success/20'
                          : 'bg-warning/10 text-warning border border-warning/20'
                      }`}
                    >
                      {log.revocado ? t('strikeRevoked') : t('strikeApplied')}
                    </span>
                    {/* Motivo enum badge */}
                    <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                      {t(`motivo_${log.motivo}`)}
                    </span>
                  </div>

                  {/* Descripción del strike */}
                  {log.descripcion && (
                    <div className="rounded-lg border border-border bg-muted px-3 py-2 text-sm text-muted-foreground prose-body">
                      <span className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-0.5">
                        {t('strikeAuditReasonLabel')}
                      </span>
                      {log.descripcion}
                    </div>
                  )}

                  {/* Motivo de revocación */}
                  {log.revocado && log.motivo_revocacion && (
                    <div className="rounded-lg border border-success/20 bg-success/10 px-3 py-2 text-sm text-success prose-body">
                      <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-success mb-0.5">
                        <CheckCircle2 className="h-3 w-3" />{' '}
                        {t('strikeAuditRevocationLabel')}
                      </span>
                      {log.motivo_revocacion}
                    </div>
                  )}
                </div>
              </div>

              {/* Right: dates */}
              <div className="ml-11 sm:ml-0 shrink-0 text-right space-y-0.5">
                <p className="text-xs text-muted-foreground">
                  {t('strikeAuditApplied')}{' '}
                  {new Date(log.aplicado_at).toLocaleString(locale, {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
                {log.revocado && log.revocado_at && (
                  <p className="text-xs text-success">
                    {t('strikeAuditRevokedAt')}{' '}
                    {new Date(log.revocado_at).toLocaleString(locale, {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
