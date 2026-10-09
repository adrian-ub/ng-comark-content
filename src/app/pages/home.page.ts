import { Component, inject, resource } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ContentService } from '../content';

@Component({
  imports: [RouterLink],
  template: `
    <section class="mx-auto max-w-6xl px-6 pb-16 pt-20 lg:px-8 lg:pb-24 lg:pt-28">
      <div class="max-w-3xl">
        <p class="mb-5 font-mono text-xs font-bold uppercase tracking-[0.28em] text-[#d95f3d]">Open notebook · Vol. 01</p>
        <h1 class="max-w-3xl text-5xl font-semibold leading-[0.95] tracking-[-0.055em] text-[#17221d] sm:text-7xl">
          Ideas worth looking at<br /><em class="font-serif font-normal text-[#d95f3d]">more closely.</em>
        </h1>
        <p class="mt-8 max-w-xl text-lg leading-8 text-[#647067]">
          ng-comark-content is an archive of notes on technology, craft, and the small decisions that make a thing matter.
        </p>
      </div>

      <div class="mt-20 border-t border-[#cfd5ca]">
        <div class="flex items-center justify-between py-5">
          <h2 class="font-mono text-xs font-bold uppercase tracking-[0.25em] text-[#647067]">Latest posts</h2>
          <span class="font-mono text-xs text-[#9aa39b]">{{ posts.value()?.length ?? 0 }} posts</span>
        </div>

        @if (posts.isLoading()) {
          <p class="py-12 text-[#647067]">Loading the archive...</p>
        } @else if (posts.error(); as error) {
          <p class="py-12 text-[#a43c2b]">{{ error }}</p>
        } @else {
          <div class="grid gap-x-10 md:grid-cols-2">
            @for (post of posts.value(); track post.path; let index = $index) {
              <a [routerLink]="['/posts', post.meta.stem.split('/').pop()]" class="group border-b border-[#d9ddd3] py-8 first:border-t md:nth-[2]:border-t">
                <div class="mb-5 flex items-center justify-between font-mono text-xs uppercase tracking-widest text-[#9aa39b]">
                  <span>{{ post.data.category }}</span>
                  <span>{{ post.data.date }}</span>
                </div>
                <h3 class="text-3xl font-semibold leading-tight tracking-[-0.035em] text-[#17221d] transition-colors group-hover:text-[#d95f3d]">
                  {{ post.data.title }}
                </h3>
                <p class="mt-4 max-w-md leading-7 text-[#647067]">{{ post.data.description }}</p>
                <span class="mt-7 inline-flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-widest text-[#d95f3d]">
                  Read note <span class="transition-transform group-hover:translate-x-1">→</span>
                </span>
              </a>
            }
          </div>
        }
      </div>
    </section>
  `,
})
export class HomePage {
  private readonly content = inject(ContentService);

  protected readonly posts = resource({
    params: () => this.content.changeVersion(),
    loader: async () =>
      (await this.content.list()).filter((item) => item.path.startsWith('/posts/')),
  });
}
