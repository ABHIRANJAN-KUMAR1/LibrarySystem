# Django Setup TODO - Digital Educational Resource Library

## Approved Plan Steps (Progress: 0/8)

- [x] 1. Create `backend/requirements.txt` with dependencies
- [x] 2. Update `backend/core/models.py` with complete models from `django_models.py`
- [x] 3. Update `backend/edulib/settings.py` with all configurations (INSTALLED_APPS, MIDDLEWARE, CORS, DB, DRF, JWT, Media)
- [x] 4. Update `backend/edulib/urls.py` with admin, api include, and media serving
- [x] 5. Ensure `backend/core/urls.py` ready (minimal)
- [ ] 6. User runs: `cd backend && pip install -r requirements.txt`
- [ ] 7. User runs: `python manage.py makemigrations core && python manage.py migrate`
- [ ] 8. User runs: `python manage.py createsuperuser` and `python manage.py runserver`

## Next Steps (Post-Setup)
- Add serializers/views to `backend/core/`
- Frontend API integration

**Setup complete! Run steps 6-8 to migrate and run server.**
