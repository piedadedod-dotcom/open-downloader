# 📥 Open Downloader

![Electron](https://img.shields.io/badge/Electron-47848F?style=for-the-badge&logo=electron&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![yt-dlp](https://img.shields.io/badge/yt--dlp-FF0000?style=for-the-badge&logo=youtube&logoColor=white)
![FFmpeg](https://img.shields.io/badge/FFmpeg-007808?style=for-the-badge&logo=ffmpeg&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)
![Platform](https://img.shields.io/badge/Platform-Windows-0078D6?style=for-the-badge&logo=windows&logoColor=white)

> **Baixe, converta, corte e organize vídeos de qualquer site — em uma única interface, com um único atalho.** O **Open Downloader** é o gerenciador de downloads de mídia que você sempre quis: rápido, offline, sem anúncios e com o poder do **yt-dlp + FFmpeg** embrulhado numa GUI moderna em **Electron + React + Tailwind**.

---

## 🎯 O que é

O **Open Downloader** transforma a linha de comando do `yt-dlp` em uma experiência visual completa. Cole uma URL, escolha a qualidade, agende compressão por **CRF**, corte trechos sem reencodar duas vezes e acompanhe tudo em uma **fila inteligente** com histórico permanente. Um **atalho global** (`Ctrl+Shift+V`) captura links da área de transferência de qualquer lugar do sistema — até com o app minimizado.

Sem telemetria, sem contas, sem propaganda. Só o seu download.

---

## ✨ Funcionalidades

- 📋 **Fila de Downloads** — adicione N links, pause, retome, reordene e acompanhe o progresso em tempo real com velocidade, ETA e tamanho.
- 📺 **Playlists** — baixe playlists inteiras do YouTube, SoundCloud e qualquer site suportado pelo `yt-dlp`, com numeração automática e retomada em caso de falha.
- 🗜️ **Compressão por CRF** — reduza o tamanho de arquivos de vídeo escolhendo o **CRF** (18 a 35) e o preset do `libx264`/`libx265`. Indicado para arquivar, enviar ou economizar disco.
- ✂️ **Cortador de Vídeo integrado** — selecione o intervalo com preview na timeline e exporte sem reencodar o vídeo inteiro (corte rápido via `-c copy`) ou com precisão frame-a-frame.
- 🗂️ **Biblioteca de Histórico** — todo download fica registrado com thumbnail, título, duração, data e caminho do arquivo. Filtre, rebaixe e reabra em um clique.
- ⌨️ **Atalho Global `Ctrl+Shift+V`** — funciona em qualquer lugar do Windows, mesmo com o app em segundo plano: detecta um link no clipboard e abre a tela de download já preenchida.
- 🌐 **Mini-Browser** — navegue dentro do app para achar o vídeo (com barra de endereço e isolamento de sessão) e clique no botão de download sem sair do programa.
- 🌑 **Tema claro/escuro** e interface 100% em **React + Tailwind**, responsiva e sem piscar.
- 🚀 **Motor offline** — `yt-dlp` e `FFmpeg` já vêm embutidos no `.exe`. Nada de `pip install` nem configurar PATH.

---

## ⌨️ Atalhos

| Atalho | Escopo | Ação |
|---|---|---|
| `Ctrl` + `Shift` + `V` | **Global** (sistema inteiro) | Lê a área de transferência, detecta URLs de mídia e abre o Open Downloader com o campo já preenchido — funciona mesmo minimizado. |
| `Ctrl` + `V` | Dentro do app | Cola URL no campo de download ativo. |
| `Ctrl` + `N` | Dentro do app | Abre o painel de **Novo Download**. |
| `Ctrl` + `L` | Dentro do app | Foca a barra de endereço do **Mini-Browser**. |
| `Ctrl` + `H` | Dentro do app | Abre a **Biblioteca de Histórico**. |
| `Ctrl` + `,` | Dentro do app | Abre as **Configurações**. |
| `Esc` | Dentro do app | Fecha o painel/modal atual. |

> 💡 O atalho global pode ser trocado em **Configurações → Atalhos**. Em teclados ABNT com `Ctrl+Shift+V` reservado por outro programa, use a combinação alternativa `Ctrl+Alt+V`.

---

## 📦 Instalação

### ✅ Método recomendado — baixar o `.exe` na aba Releases

1. Acesse a aba **[Releases](../../releases)** do repositório.
2. Baixe o instalador mais recente: **`OpenDownloader-Setup-x.y.z.exe`** (instalador) ou **`OpenDownloader-x.y.z-portable.exe`** (portátil, sem instalação).
3. Execute o arquivo e aceite o UAC se solicitado.
4. Siga o assistente (ou simplesmente rode o portátil). O ícone aparecerá na **área de trabalho** e na **bandeja do sistema**.
5. Na primeira execução, o app verifica o `yt-dlp` e o `FFmpeg` embutidos e baixa atualizações de binários apenas se você autorizar.

### Pré-requisitos

- **Windows 10 ou 11** (64-bit) — o `.exe` já traz Electron, `yt-dlp` e `FFmpeg` empacotados.
- **Conexão com a internet** para baixar mídias.
- **Espaço em disco** para os arquivos escolhidos (o app indica antes de iniciar).
- *(Opcional)* Conta/cookies para conteúdo autenticado — configurável em **Configurações → Autenticação**.

### Primeiro uso em 30 segundos

1. Copie a URL de qualquer vídeo (`Ctrl+C`).
2. Pressione **`Ctrl+Shift+V`** em qualquer lugar.
3. O Open Downloader abre com o link preenchido — escolha formato (MP4/MP3), qualidade e clique em **Baixar**.
4. Acompanhe na **fila** e encontre o arquivo depois na **Biblioteca de Histórico**.

---

## 🛠️ Desenvolvimento (build a partir do código)

```bash
git clone <seu-repo>/open-downloader.git
cd open-downloader
npm install
npm run dev        # ambiente de desenvolvimento (Electron + Vite)
npm run build      # gera o instalador em /dist

🤝 Créditos
O Open Downloader é apenas a casca amigável. O mérito real pertence a dois projetos gigantes da comunidade open source:

🎬 yt-dlp — o motor de extração e download que dá suporte a milhares de sites. Fork do youtube-dl, distribuído sob a Unlicense. Sem ele, nada disso existiria.

🎞️ FFmpeg — o canivete suíço de áudio e vídeo responsável por conversão, compressão CRF, muxing e o cortador. Distribuído sob LGPL/GPL (dependendo dos módulos compilados).

Agradecimentos especiais a todos os contribuidores desses dois projetos e à comunidade Electron/React/Tailwind.

📄 Licença
Distribuído sob a MIT License. Os binários empacotados (yt-dlp, FFmpeg) mantêm suas próprias licenças originais.

text
MIT License

Copyright (c) 2024-2026 Open Downloader contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
<p align="center"> Feito com ⚡ Electron + React + Tailwind, movido a yt-dlp + FFmpeg.<br/> <a href="../../releases">⬇️ Baixe a versão mais recente</a> · <a href="../../issues">🐞 Reportar bug</a> · <a href="../../discussions">💬 Discutir</a> </p> ```