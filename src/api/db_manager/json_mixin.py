from sqlalchemy.orm import class_mapper
import datetime
import json



class JsonSerializableMixin:
    def _serialize_related(self, obj):
        """Сериализует связанный объект"""
        if hasattr(obj, 'to_dict'):
            return obj.to_dict(
                exclude=[rel.key for rel in class_mapper(obj.__class__).relationships])
        return str(obj)

    def to_dict(self, exclude: list=None, only: list=None):
        """Преобразует модель в словарь.        
        Args:
            exclude: список полей, которые нужно исключить
            only: список полей, которые нужно включить (если указан, остальные исключаются)
        """
        if exclude is None:
            exclude = []
        if only is None:
            only = []
        
        mapper = class_mapper(self.__class__)
        
        result = {}
        for column in mapper.columns:
            if column.key in exclude:
                continue
            if only and column.key not in only:
                continue
            
            value = getattr(self, column.key)
            if isinstance(value, datetime.datetime):
                value = value.isoformat()
            elif isinstance(value, datetime.date):
                value = value.isoformat()
            elif isinstance(value, bytes):
                value = value.decode('utf-8', errors='ignore')
            result[column.key] = value

        for relationship in mapper.relationships:
            if relationship.key in exclude:
                continue
            if only and relationship.key not in only:
                continue
            
            rel_value = getattr(self, relationship.key)
            if rel_value is None:
                result[relationship.key] = None
            elif relationship.uselist:
                result[relationship.key] = [
                    self._serialize_related(item) 
                    for item in rel_value
                ]
            else:
                result[relationship.key] = self._serialize_related(rel_value)
        
        return result


    def to_json(self, exclude: list=None, only: list=None, **kwargs):
        return json.dumps(self.to_dict(exclude=exclude, only=only), ensure_ascii=False, **kwargs)

    def __str__(self):
        return self.to_json()

    def __repr__(self):
        return self.to_json()