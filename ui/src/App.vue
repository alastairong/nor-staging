<template>
  <div>
    <div v-if="loading">
      <mwc-circular-progress indeterminate></mwc-circular-progress>
    </div>
    <div v-else>
      <div id="content" style="display: flex; flex-direction: column; flex: 1;">
        <h2>Welcome to the Nor Staging Site</h2>
        
        <div v-if="IS_HOLO && !isLoggedIn">
          <h4>Click the sign up button below to generate your keys</h4>

          <mwc-button
            style="margin-top: 16px"
            raised
            label="Sign Up"
            @click="signup" 
          />

          <h4>If you already have an identity, click login below to re-generate them from your email and password instead</h4>
          <mwc-button
            style="margin-top: 16px"
            raised
            label="Login"
            @click="login" 
          />
        </div>
        <div v-else-if="IS_HOLO && isLoggedIn">
          <h4>You are logged in with the following agent pubKey</h4>
          <h4> {{ agentId }}</h4>
          <mwc-button
            style="margin-top: 16px"
            raised
            label="Logout"
            @click="logout" 
          />
        </div> 
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent, computed } from 'vue';
import { AppAgentClient, AppAgentWebsocket, AgentPubKeyB64 } from '@holochain/client';
import WebSdk from '@holo-host/web-sdk';
import type { AgentState } from '@holo-host/web-sdk';
import '@material/mwc-circular-progress';
import '@material/mwc-button';

export default defineComponent({
  components: {
    // Add your subcomponents here
  },
  data(): {
    client: AppAgentClient | undefined;
    agentId: AgentPubKeyB64 | undefined;
    isLoggedIn: boolean;
    loading: boolean;
    IS_HOLO: boolean;
  } {
    return {
      client: undefined,
      agentId: undefined,
      isLoggedIn: false,
      loading: true,
      IS_HOLO: ['true', '1', 't'].includes(import.meta.env.VITE_APP_IS_HOLO?.toLowerCase()),
    };
  },
  async mounted() {
    if (this.IS_HOLO) {
      console.log("!!!!!!!!")
      const client: WebSdk = await WebSdk.connect({
        chaperoneUrl: import.meta.env.VITE_APP_CHAPERONE_URL,
        authFormCustomization: {
          appName: 'Nor Staging App',
          requireRegistrationCode: false
        }
      });
      console.log("Client loaded")
      client.on('agent-state', (agent_state: AgentState) => {
        this.loading = !agent_state.isAvailable
        this.agentId = agent_state.id

        if (agent_state.isAvailable && !agent_state.isAnonymous) {
          this.isLoggedIn = true
        }
      });

      this.client = client
    } else {
      // We pass '' as url because it will dynamically be replaced in launcher environments
      this.client = await AppAgentWebsocket.connect('', 'vue-default');
      this.loading = false;
    }
  },
  methods: {
    async signup () {
      await (this.client as WebSdk).signUp({ cancellable: true });
    },

    async login () {
      await (this.client as WebSdk).signIn({ cancellable: true });
    },

    async logout () {
      await (this.client as WebSdk).signOut();
      await (this.client as WebSdk).signIn({ cancellable: true });
    }
  },
  provide() {
    return {
      client: computed(() => this.client),
    };
  },
});
</script>
