<template>
  <div class="login">
    <!-- Sonic-depth ambient background -->
    <div class="login__backdrop">
      <div class="login__glow"></div>
      <div class="login__fade login__fade--bottom"></div>
      <div class="login__fade login__fade--side"></div>
    </div>

    <div class="login__stage">
      <div class="login__column">
        <!-- Login card -->
        <div class="login-card">
          <div class="login-card__logo">
            <span aria-hidden="true" class="material-symbols-outlined fill"
              >graphic_eq</span
            >
          </div>

          <h1 class="login-card__title">Visualize your rhythm.</h1>
          <p class="login-card__lead">
            Discover your top tracks across time, analyze your listening habits,
            and see your musical journey unfold.
          </p>

          <!-- Auth error -->
          <div v-if="errorMessage" class="login-card__error-wrap">
            <div class="login-card__error">
              <span
                aria-hidden="true"
                class="material-symbols-outlined login-card__error-icon"
                >error</span
              >
              <p class="login-card__error-text">
                {{ errorMessage }}
              </p>
            </div>
          </div>

          <div class="login-card__action">
            <button type="button" class="connect-button" @click="handleLogin">
              <svg
                class="connect-button__logo"
                fill="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.299.421-1.02.599-1.559.3z"
                />
              </svg>
              <span class="connect-button__label">Connect with Spotify</span>
            </button>
          </div>

          <p class="login-card__note">
            By connecting, Sporky reads your Spotify profile and top tracks.
            Nothing is stored outside your browser.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useSporky } from '~/stores/sporky';

definePageMeta({ layout: false });

const store = useSporky();
const route = useRoute();

const handleLogin = async () => {
  try {
    await store.login();
  } catch (error) {
    console.error('Login failed:', error);
  }
};

const errorParam = computed(() => route.query.error as string | undefined);
const errorMessage = computed(() => {
  switch (errorParam.value) {
    case undefined:
      return null;
    case 'access_denied':
      return 'Access was denied. Please try again.';
    case 'no_code':
      return 'Authorization failed. Please try again.';
    case 'state_mismatch':
      return 'Login session expired or was tampered with. Please try again.';
    case 'auth_failed':
      return 'Authentication failed. Please check your credentials.';
    default:
      return 'An error occurred during login. Please try again.';
  }
});
</script>

<style scoped lang="scss">
.login {
  position: relative;
  display: flex;
  min-height: 100vh;
  width: 100%;
  flex-direction: column;
  overflow: hidden;
  background-color: token(background);
}

// Sonic-depth ambient background: two soft glows under two fades.
.login__backdrop {
  position: absolute;
  inset: 0;
  z-index: 0;
}

.login__glow {
  width: 100%;
  height: 100%;
  opacity: 0.8;
  mix-blend-mode: screen;
  background:
    radial-gradient(
      circle at 30% 30%,
      alpha(primary-container, 25%) 0%,
      transparent 55%
    ),
    radial-gradient(circle at 70% 60%, alpha(primary, 12%) 0%, transparent 50%);
}

.login__fade {
  position: absolute;
  inset: 0;

  &--bottom {
    background-image: linear-gradient(
      to top,
      token(background),
      alpha(background, 80%),
      transparent
    );
  }

  &--side {
    background-image: linear-gradient(
      to right,
      token(background),
      transparent,
      alpha(background, 50%)
    );
  }
}

.login__stage {
  position: relative;
  z-index: 10;
  display: flex;
  flex: 1 1 0%;
  align-items: center;
  justify-content: center;
  padding: var(--section-margin) var(--container-padding);
}

.login__column {
  display: flex;
  width: 100%;
  max-width: 480px;
  flex-direction: column;
}

.login-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  border: 1px solid alpha(surface-bright, 20%);
  border-radius: var(--radius-xl);
  background-color: alpha(surface-container-high, 80%);
  padding: var(--card-gap);
  box-shadow: 0 25px 50px -12px rgb(0 0 0 / 0.25);
  backdrop-filter: blur(24px);
}

.login-card__logo {
  margin-bottom: space(6);
  display: flex;
  width: space(16);
  height: space(16);
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-full);
  background-color: alpha(primary-container, 20%);

  .material-symbols-outlined {
    @include icon-size('4xl');
    color: token(primary);
  }
}

.login-card__title {
  padding-top: space(2);
  padding-bottom: space(4);
  text-align: center;
  @include type(display-lg-mobile);
  color: token(on-surface);

  @include from(md) {
    @include type(display-lg);
  }
}

.login-card__lead {
  max-width: 320px;
  padding: 0 space(4) space(8);
  text-align: center;
  @include type(body-lg);
  color: token(on-surface-variant);
}

.login-card__error-wrap {
  width: 100%;
  padding-bottom: space(6);
}

.login-card__error {
  display: flex;
  align-items: center;
  gap: space(3);
  border: 1px solid alpha(error, 20%);
  border-radius: var(--radius-lg);
  background-color: alpha(error-container, 20%);
  padding: space(4);
}

.login-card__error-icon {
  @include icon-size(xl);
  color: token(error);
}

.login-card__error-text {
  @include type(body-sm);
  color: token(on-surface-variant);
}

.login-card__action {
  display: flex;
  width: 100%;
  justify-content: center;
  padding-bottom: space(4);
}

.connect-button {
  display: flex;
  height: space(14);
  width: 100%;
  max-width: 400px;
  cursor: pointer;
  align-items: center;
  justify-content: center;
  gap: space(3);
  overflow: hidden;
  border-radius: var(--radius-full);
  background-color: token(primary-container);
  padding-inline: space(6);
  font-weight: 700;
  letter-spacing: 0.025em;
  color: token(on-primary-container);
  box-shadow:
    0 10px 15px -3px alpha(primary-container, 20%),
    0 4px 6px -4px alpha(primary-container, 20%);
  @include transition-colors(300ms);

  &:hover {
    background-color: token(primary-fixed-dim);
    color: token(on-primary);
  }
}

.connect-button__logo {
  width: space(6);
  height: space(6);
}

.connect-button__label {
  @include truncate;
  @include size(lg);
}

.login-card__note {
  max-width: 280px;
  padding-top: space(6);
  text-align: center;
  @include type(body-sm);
  color: alpha(on-surface-variant, 60%);
}
</style>
