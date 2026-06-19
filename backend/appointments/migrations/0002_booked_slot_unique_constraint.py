from django.db import migrations, models
from django.db.models import Q


class Migration(migrations.Migration):

    dependencies = [
        ("appointments", "0001_initial"),
    ]

    operations = [
        migrations.AlterUniqueTogether(
            name="appointment",
            unique_together=set(),
        ),
        migrations.AddConstraint(
            model_name="appointment",
            constraint=models.UniqueConstraint(
                condition=Q(status="BOOKED"),
                fields=("doctor", "date", "start_time"),
                name="unique_booked_doctor_slot",
            ),
        ),
    ]
