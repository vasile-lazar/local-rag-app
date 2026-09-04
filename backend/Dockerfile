FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build

WORKDIR /src

COPY RagApp.Api/RagApp.Api.csproj RagApp.Api/
COPY RagApp.BusinessLayer/RagApp.BusinessLayer.csproj RagApp.BusinessLayer/
COPY RagApp.DataAccess/RagApp.DataAccess.csproj RagApp.DataAccess/
COPY RagApp.Domain/RagApp.Domain.csproj RagApp.Domain/

RUN dotnet restore RagApp.Api/RagApp.Api.csproj

COPY RagApp.Api/ RagApp.Api/
COPY RagApp.BusinessLayer/ RagApp.BusinessLayer/
COPY RagApp.DataAccess/ RagApp.DataAccess/
COPY RagApp.Domain/ RagApp.Domain/

RUN dotnet publish RagApp.Api/RagApp.Api.csproj \
    -c Release \
    -o /app


FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime

WORKDIR /app

COPY --from=build /app .

EXPOSE 5134

ENV ASPNETCORE_URLS=http://+:5134

ENTRYPOINT ["dotnet", "RagApp.Api.dll"]