import { merge } from "lodash";
import { mount, VueWrapper } from "@vue/test-utils";
import { render } from "@testing-library/vue";
import { App, ComponentPublicInstance, DefineComponent } from "vue";
import { RouteLocationRaw } from "vue-router";
import createNoteStorage from "../../src/store/createNoteStorage";

interface VuePlugin {
  install: (app: App) => void;
}

class RenderingHelper {
  private comp;

  private props = {};

  private route = {};

  private global = {
    directives: {
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      focus() {},
    },
    stubs: {
      "router-view": true,
      "router-link": {
        props: ["to"],
        template: `<a class="router-link" :to='JSON.stringify(to)'><slot/></a>`,
      },
    },
  };

  constructor(comp: DefineComponent) {
    this.comp = comp;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  withStorageProps(props: any) {
    return this.withProps({ storageAccessor: createNoteStorage(), ...props });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  withProps(props: any) {
    this.props = props;
    return this;
  }

  withMockRouterPush(push) {
    this.withGlobalMock({ $router: { push } });
    return this;
  }

  withGlobalPlugin(plugin: VuePlugin) {
    this.global = merge(this.global, { plugins: [plugin] });
    return this;
  }

  withGlobalMock(mocks: Record<string, unknown>) {
    this.global = merge(this.global, { mocks });
    return this;
  }

  currentRoute(route: RouteLocationRaw) {
    this.route = route;
    return this;
  }

  render() {
    return render(this.comp, this.options);
  }

  mount(
    options: Record<string, unknown> = {}
  ): VueWrapper<ComponentPublicInstance> {
    return mount(this.comp, { ...this.options, ...options });
  }

  private get options() {
    return {
      propsData: this.props,
      global: merge(this.global, {
        mocks: {
          $route: this.route,
        },
      }),
    };
  }
}

export default RenderingHelper;
