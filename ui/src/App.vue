<template>
  <div>
    <div v-if="loading">
      <mwc-circular-progress indeterminate></mwc-circular-progress>
    </div>
    <div v-else>
      <div id="content" style="display: flex; flex-direction: column; flex: 1;">
        <h2>Welcome to the Nor Staging Site</h2>

        <div v-if="IS_HOLO && !isLoggedIn">

          <p>Nor is a big believer in distributed, federated identity. That means we do not control your ID, tokens or keys - you do.</p>
        
          <h3>Single Sign-On Experience</h3>
          <p>Like all other sophisticated identity systems, our Nor login allows for a SSO experience for you</p>
          <p>that means you can use the same keys (username, password) across many applications, browsers and devices.</p>

          <h3>User-Controlled Identity</h3>
          <p>Like with Blockchain wallet solutions, the Nor identity puts the user in control since only you have your keys.</p>
          <p>However, the Nor identity does not require you to download a wallet and step into complex and clunky infrastructure.</p>
          <h4>It feels like a 'normal' account.</h4>

          <h3>Technology</h3>
          <p>Nor uses Holochain, Holo, and Nom technologies for its identity.</p>
          <p>Holochain enables the network, provides key management allowing users to change their keys without losing their identity,</p>
          <p>is low cost due to the consensus-less system and does not require individual users to pay to register their identity</p>
          <p>Holo serves this identity through web browsers via a distributed hosting network. Nom provides the namespace layer to ensure logins are unique.</p>
          
          <h3>Ready to Enter the Nor Realm?</h3>
          <p>Now you understand the system a little more, you are ready to enter the Nor realm.</p>
          <p>Click the sign up button below to generate your keys</p>

          <mwc-button
            style="margin-top: 16px"
            raised
            label="Sign Up"
            @click="signup" 
          />

          <p>If you already have an identity, click Login to re-generate your keys from your email and password </p>
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
