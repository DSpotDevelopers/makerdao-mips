import { AfterViewInit, Component, Input, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-proposal-components',
  templateUrl: './proposal-components.component.html',
  styleUrls: ['./proposal-components.component.scss']
})
export class ProposalComponentsComponent implements OnInit, AfterViewInit {

  @Input() sourceData;
  prefixIdLinkSection: string = "sectionLink-";
  @ViewChild('sectionLinks') sectionLinks;

  constructor(
    private router: Router,
    private route: ActivatedRoute) { }

  ngOnInit(): void {
  }

  ngAfterViewInit() {
    this.route.fragment.subscribe(data => {
      this.setActiveLinkSection(data);
    });
  }

  getLinkBySection(text: string): string {
    let url = this.router.url.split('#')[0];
    const escapedText = text.toLowerCase().replace(/[^\w]+/g, '-');

    return `${url}#${escapedText}`;
  }

  idBySection(text: string): string {
    const escapedText = text.toLowerCase().replace(/[^\w]+/g, '-');

    return this.prefixIdLinkSection + escapedText;
  }

  setActiveLinkSection(str: string) {
    this.findSectionLink(str);
  }

  findSectionLink(str: string) {
    let elem = document.querySelector("#" + this.prefixIdLinkSection + str);

    if (elem) {
      elem.classList.toggle('active');
    }

    let sectionLinks = (this.sectionLinks.nativeElement as HTMLElement).getElementsByTagName('a');

    for (let index = 0; index < sectionLinks.length; index++) {
      if (sectionLinks.item(index) !== elem) {
        sectionLinks.item(index).classList.remove('active');
      }
    }
  }

}
