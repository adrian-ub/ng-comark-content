import { Component, inject, resource } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MarkdownDocument } from '@comark/angular';
import type { ContentFile } from 'comark-content';
import { ContentService } from '../content';

@Component({
  imports: [MarkdownDocument, RouterLink],
  template: `
    <section class="mx-auto max-w-4xl px-6 pb-20 pt-16 lg:px-8 lg:pt-24">
      <a routerLink="/" class="font-mono text-xs font-bold uppercase tracking-widest text-[#d95f3d] hover:text-[#17221d]">← Back to archive</a>

      @if (post.isLoading()) {
        <p class="py-24 text-[#647067]">Opening the note...</p>
      } @else if (post.error(); as error) {
        <p class="py-24 text-[#a43c2b]">{{ error }}</p>
      } @else if (post.value(); as entry) {
        <header class="border-b border-[#cfd5ca] pb-12 pt-16">
          <div class="flex flex-wrap items-center gap-x-4 gap-y-2 font-mono text-xs uppercase tracking-widest text-[#9aa39b]">
            <span class="text-[#d95f3d]">{{ entry.data.category }}</span>
            <span aria-hidden="true">/</span>
            <span>{{ entry.data.date }}</span>
            <span aria-hidden="true">/</span>
            <span>{{ entry.data.readingTime }} min read</span>
          </div>
          <h1 class="mt-7 max-w-3xl text-5xl font-semibold leading-[0.98] tracking-[-0.055em] text-[#17221d] sm:text-7xl">{{ entry.data.title }}</h1>
          <p class="mt-7 max-w-2xl text-xl leading-8 text-[#647067]">{{ entry.data.description }}</p>
        </header>

        <comark-markdown-document
          class="prose prose-lg mt-12 block max-w-2xl text-[#344239] prose-headings:font-semibold prose-headings:tracking-tight prose-a:text-[#d95f3d] prose-blockquote:border-[#d95f3d] prose-blockquote:text-[#647067]"
          [value]="toDocument(entry)"
        />
      }
    </section>
  `,
})
export class PostPage {
  private readonly content = inject(ContentService);
  private readonly route = inject(ActivatedRoute);
  private readonly id = this.route.snapshot.paramMap.get('id') ?? '';

  protected readonly post = resource({
    params: () => `${this.id}:${this.content.changeVersion()}`,
    loader: () => this.content.get(`/posts/${this.id}`),
  });

  protected toDocument(entry: ContentFile): {
    nodes: ContentFile['nodes'];
    frontmatter: ContentFile['data'];
    meta: ContentFile['meta'];
  } {
    return {
      nodes: entry.nodes,
      frontmatter: entry.data,
      meta: entry.meta,
    };
  }
}
