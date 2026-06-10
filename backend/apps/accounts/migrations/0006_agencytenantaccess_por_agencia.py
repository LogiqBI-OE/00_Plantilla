"""
Refactor de AgencyTenantAccess: acceso por agencia (Opcion 2-A).

Antes: (user L8, tenant) — el acceso se asignaba por cada usuario L8.
Ahora: (agency, tenant) — el acceso se asigna a la agencia (Tenant type=agency)
y todos sus L8 lo heredan.

Las filas previas no se pueden mapear (su `user.agency` quedo en NULL al
reconciliar la entidad Agency en 0005, y nunca hubo datos reales de agencia),
asi que se limpian antes de reestructurar.
"""
import django.db.models.deletion
from django.db import migrations, models


def clear_access(apps, schema_editor):
    apps.get_model('accounts', 'AgencyTenantAccess').objects.all().delete()


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0005_alter_user_agency_remove_agencylicense_agency_and_more'),
        ('tenants', '0003_tenant_type'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='agencytenantaccess',
            options={
                'ordering': ['agency', 'tenant'],
                'verbose_name': 'Acceso de agencia a tenant',
                'verbose_name_plural': 'Accesos de agencia a tenants',
            },
        ),
        migrations.AlterUniqueTogether(
            name='agencytenantaccess',
            unique_together=set(),
        ),
        migrations.RunPython(clear_access, migrations.RunPython.noop),
        migrations.RemoveField(
            model_name='agencytenantaccess',
            name='user',
        ),
        migrations.AddField(
            model_name='agencytenantaccess',
            name='agency',
            field=models.ForeignKey(
                default=0,
                help_text='Agencia (Tenant type=agency) a la que se le otorga acceso.',
                on_delete=django.db.models.deletion.CASCADE,
                related_name='managed_access',
                to='tenants.tenant',
            ),
            preserve_default=False,
        ),
        migrations.AlterField(
            model_name='agencytenantaccess',
            name='tenant',
            field=models.ForeignKey(
                help_text='Tenant cliente que la agencia podra gestionar.',
                on_delete=django.db.models.deletion.CASCADE,
                related_name='agency_access',
                to='tenants.tenant',
            ),
        ),
        migrations.AlterUniqueTogether(
            name='agencytenantaccess',
            unique_together={('agency', 'tenant')},
        ),
    ]
