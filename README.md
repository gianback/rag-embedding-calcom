## 📦 RAG Embeddings Pipeline

Este módulo procesa el repositorio de `cal.com` para generar los embeddings usados en el sistema RAG.  
El flujo es simple:

1. Se clona el repositorio.  
2. Se parsean los archivos con **Tree-sitter** para identificar funciones, clases y otros fragmentos relevantes.  
3. Para cada fragmento se genera una **descripción corta** con ayuda del modelo.  
4. Esa descripción se transforma en un **embedding** y se almacena en una base vectorial junto con su metadata  
   (path del archivo + descripción generada).  
5. Todo esto ocurre en un preproceso único; las consultas no vuelven a recalcular embeddings.

Este índice vectorial permite recuperar rápidamente los fragmentos más útiles durante las conversaciones del agente.
