# Instalar node
FROM node:25-alpine

# Crear la carpeta en donde vamos a copiar el proyecto
WORKDIR /app

COPY package.json package-lock.json ./
#Copiar el proyecto al contenedor / imagen
COPY . .

# Instalar las dependencias
RUN npm i

COPY . .
# Compilar el proyecto
RUN npm run build

EXPOSE 3000
# Elegir un comando de inicio
CMD ["node", "dist/main.js"]