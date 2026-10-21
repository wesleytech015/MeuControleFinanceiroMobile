# MeuControleFinanceiroMobile
Aplicativo de controle financeiro pessoal desenvolvido em React Native, integrado ao backend e banco de dados do MeuControleFinanceiroWeb.

## Objetivo e equipe

Projeto acadêmico de Wesley, Marcus, Eliezer e Davi. A base mobile utiliza Expo SDK 58, React Native e TypeScript. O backend Node.js/Express e MySQL da versão Web será reaproveitado futuramente; esta etapa contém somente navegação e telas placeholder, sem autenticação, API ou regras de negócio.

## Pré-requisitos

- Node.js 24 LTS (24.3 ou superior, dentro da versão 24; veja `.nvmrc`) e npm.
- Git e VS Code.
- Para Android: dispositivo com Expo Go compatível com o SDK 58 ou emulador configurado no Android Studio. Caso o Expo Go disponível não suporte o SDK, será necessário um development build compatível.
- iOS exige dispositivo compatível ou macOS com simulador para execução nativa local.

## Instalação e execução

```powershell
git clone https://github.com/wesleytech015/MeuControleFinanceiroMobile.git
cd MeuControleFinanceiroMobile
git switch develop
npm ci
npm start
```

Enquanto o PR da base não estiver integrado, use `git switch feature/base-mobile` após o clone.
No terminal do Expo, leia o QR code com um dispositivo compatível na mesma rede ou pressione `a` para abrir um emulador Android configurado.

```powershell
npm run android
npm run ios
npm run web
npm run typecheck
npx expo install --check
npx expo-doctor
```

`android` e `ios` iniciam o servidor e tentam abrir o app; não geram um build nativo. Para conferir a compilação JavaScript Android sem emulador: `npx expo export --platform android`. Isso não substitui um teste no dispositivo.

## Estrutura

```text
src/
  components/  # componentes compartilhados
  navigation/  # abas Início, Receitas, Despesas e Movimentações
  screens/     # telas placeholder independentes
  services/    # reservado para serviços futuros
  theme/       # cores compartilhadas
  types/       # tipos de navegação
```

## Git Flow e colaboração

`main` representa produção e `develop` integração/homologação. Ambas são protegidas; trabalhe em branches próprias e nunca faça commit diretamente nelas.

Antes de cada tarefa, com o diretório de trabalho limpo:

```powershell
git switch develop
git pull --ff-only origin develop
git switch -c feature/nome-da-tarefa
```

Cada integrante deve clonar o projeto em seu ambiente, manter sua própria branch e combinar a responsabilidade pelas telas para reduzir conflitos. Instale dependências com `npm ci`; para dependências nativas, prefira `npx expo install nome-do-pacote` e versione `package-lock.json` junto com `package.json`.

Valide a alteração, faça commits na feature e publique com `git push -u origin feature/nome-da-tarefa`. Abra um Pull Request com destino **develop** e solicite revisão de outro integrante. Promoções para `main` devem passar pelo fluxo de revisão da equipe. Não use force push nas branches compartilhadas.

Não versione `.env`, credenciais, bancos locais, `node_modules`, `.expo` ou builds. Não há configuração de API nem segredos nesta base.

## Validação manual antes do PR

- Abrir o app e confirmar a tela Início.
- Alternar entre Receitas, Despesas e Movimentações e retornar a Início.
- Confirmar os títulos e o aviso de desenvolvimento de cada tela.
- Verificar em um dispositivo Android se os textos e a barra inferior estão visíveis, inclusive com fonte ampliada.
- Registrar no PR o dispositivo e a versão do sistema usados. A exportação do bundle não comprova o funcionamento nativo.

Referências: [Expo e TypeScript](https://docs.expo.dev/guides/typescript/) e [instalação do React Navigation](https://reactnavigation.org/docs/getting-started/).

## Pendências conhecidas da base

Na preparação inicial, `npm audit` reportou 15 alertas altos na cadeia Expo/Metro, relacionados a `braces` e `node-forge`. A tentativa de correção sem `--force` manteve esses alertas; a sugestão automática restante rebaixa o Expo para uma versão incompatível com esta base. Acompanhar as atualizações do ecossistema e reavaliar antes de publicar uma versão de produção. Não executar `npm audit fix --force` sem avaliar a compatibilidade.
