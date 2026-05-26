"""Manager para modelos tenant-scoped."""
from django.db import models


class TenantScopedManager(models.Manager):
    """
    Manager para modelos que heredan de `TenantScopedModel`.

    El manager por defecto retorna TODOS los objetos (sin filtro automatico).
    Esto es intencional: permite que migraciones, comandos `manage.py` y
    el Django admin funcionen sin necesidad de un request.

    Las VIEWS deben usar explicitamente:
        MyModel.objects.for_request(request)

    Para evitar fugas de datos entre tenants. Si una vista usa
    `MyModel.objects.all()`, esta cruzando fronteras de tenant y es un bug.
    """

    def for_request(self, request):
        """Filtra por el tenant del request (None -> queryset vacio)."""
        tenant = getattr(request, 'tenant', None)
        if tenant is None:
            return self.none()
        return self.filter(tenant=tenant)
