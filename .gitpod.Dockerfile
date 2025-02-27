# syntax=docker.io/docker/dockerfile:1.5.2
FROM gitpod/workspace-full-vnc
# ---------------------------------------------------
# -------------------- USER root --------------------
# ---------------------------------------------------

USER root

# Install Cypress dependencies.
RUN apt-get -y update \
    && DEBIAN_FRONTEND=noninteractive apt-get install -y \
    libgtk2.0-0 \
    libgtk-3-0 \
    libgbm-dev \
    libnotify-dev \
    libgconf-2-4 \
    libnss3 \
    libxss1 \
    libasound2 \
    libxtst6 \
    xauth \
    xvfb \
    zsh \
    htop \
    lsof \
    net-tools \
    git-all \
    vim \
    git-extras \
    unzip \
    wget \
    zip \
    bash-completion \
    procps \
    gnupg \
    curl \
    gawk \
    dirmngr \
    xclip \
    fasd \
    fzf \
    cargo \
    && apt-get autoremove \
    && rm -rf /var/lib/apt/lists/* \
    && rm -rf /var/cache/apt \
    && rm -rf /nix \
    && rm -rf /home/gitpod/.nix-channels \
    && rm -rf /home/gitpod/.nix-defexpr \
    && rm -rf /home/gitpod/.nix-profile \
    && rm -rf /home/gitpod/.config/nixpkgs

# use bash over dash for /bin/sh
RUN dpkg-reconfigure dash
RUN cargo install dum

# RUN addgroup --system nixbld \
#  && adduser gitpod nixbld \
#  && for i in $(seq 1 30); do useradd -ms /bin/bash nixbld$i && adduser nixbld$i nixbld; done

RUN mkdir -m 0755 /nix && chown gitpod /nix \
    && mkdir -p /etc/nix && echo 'sandbox = false' > /etc/nix/nix.conf

# -----------------------------------------------------
# -------------------- USER gitpod --------------------
# -----------------------------------------------------

# Setup gitpod workspace user, zsh and zimfw

CMD /bin/bash -l
USER gitpod
ENV USER gitpod
WORKDIR /home/gitpod

# Install Nix
RUN touch .bash_profile \
    && curl https://nixos.org/releases/nix/nix-2.13.2/install | sh

RUN echo '. /home/gitpod/.nix-profile/etc/profile.d/nix.sh' >> /home/gitpod/.bashrc
RUN mkdir -p /home/gitpod/.config/nixpkgs && echo '{ allowUnfree = true; }' >> /home/gitpod/.config/nixpkgs/config.nix

RUN mkdir -p /home/gitpod/.config/nix \
    && touch /home/gitpod/.config/nix/nix.conf \
    && echo "experimental-features = nix-command flakes" >> /home/gitpod/.config/nix/nix.conf

# Install cachix
RUN . /home/gitpod/.nix-profile/etc/profile.d/nix.sh \
    && nix-env -iA cachix -f https://cachix.org/api/v1/install \
    && cachix use cachix

# Install git
RUN . /home/gitpod/.nix-profile/etc/profile.d/nix.sh \
    && nix-env -i git git-lfs

# xclip
RUN echo "alias pbcopy='xclip -selection clipboard'" >> /home/gitpod/.bashrc \
    && echo "alias pbpaste='xclip -selection clipboard -o'" >> /home/gitpod/.bashrc

RUN echo "alias pbcopy='xclip -selection clipboard'" >> /home/gitpod/.zshrc \
    && echo "alias pbpaste='xclip -selection clipboard -o'" >> /home/gitpod/.zshrc

EXPOSE 5173
EXPOSE 3309
EXPOSE 5900
EXPOSE 6080
EXPOSE 8081
EXPOSE 9081
EXPOSE 9082
EXPOSE 5001
EXPOSE 2525
