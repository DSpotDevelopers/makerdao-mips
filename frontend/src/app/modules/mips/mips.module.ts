import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MipsRoutingModule } from './mips-routing.module';
import { ListComponent } from './components/list/list.component';
import { MatTableModule } from '@angular/material/table';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatPaginatorModule} from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { StatusComponent } from './components/status/status.component';
import { SocialComponent } from './components/social/social.component';
import { SearchComponent } from './components/search/search.component';
import { FilterComponent } from './components/filter/filter.component';
import { ListPageComponent } from './pages/list-page/list-page.component';
import { MipsPaginationComponent } from './components/mips-pagination/mips-pagination.component';
import { ProposalComponentsComponent } from './components/proposal-components/proposal-components.component';
import { MipDetailsComponent } from './components/mip-details/mip-details.component';
import { PullRequestHistoryComponent } from './components/pull-request-history/pull-request-history.component';
import { DetailContentComponent } from './components/detail-content/detail-content.component';
import { DetailsPageComponent } from './pages/details-page/details-page.component';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { SearchMobileComponent } from './components/search-mobile/search-mobile.component';
import { OrderMobileComponent } from './components/order-mobile/order-mobile.component';
import { DetailsMobilesButtonsComponent } from './components/details-mobiles-buttons/details-mobiles-buttons.component';
import { MarkdownModule } from 'ngx-markdown';
import { FeedbackComponent } from './components/feedback/feedback.component';
import { MatIconModule } from '@angular/material/icon';
import { FilterListComponent } from './components/filter-list/filter-list.component';
import { FilterListItemComponent } from './components/filter-list-item/filter-list-item.component';
import { FilterListHostDirective } from './directives/filter-list-host.directive';
import { SecurityContext } from '@angular/core';
import { MdCheckboxComponent } from './components/md-checkbox/md-checkbox.component';
import { MdCheckboxMobileComponent } from './components/md-checkbox-mobile/md-checkbox-mobile.component';
import { SubproposalsComponent } from './components/subproposals/subproposals.component';
import {OverlayModule} from '@angular/cdk/overlay';
import { SideContentComponent } from './components/side-content/side-content.component';
import { ReferencesComponent } from './components/references/references.component';
import { OptionAutocompleteComponent } from './components/option-autocomplete/option-autocomplete.component';
import { AutocompleteComponent } from './components/autocomplete/autocomplete.component';
import { AutocompleteContentDirective } from './directives/autocomplete-content.directive';
import { AutocompleteDirective } from './directives/autocomplete.directive';
import { ReactiveFormsModule } from '@angular/forms';
import { FilterPipe } from './pipes/filter.pipe';
import { FormsModule } from '@angular/forms';
import { ContenteditableValueAccessorModule } from '@tinkoff/angular-contenteditable-accessor';
import { InputFormattingComponent } from './components/input-formatting/input-formatting.component';
import { InputFormattingRefDirective } from './directives/input-formatting-ref.directive';


@NgModule({
  declarations: [
    ListComponent,
    StatusComponent,
    SocialComponent,
    SearchComponent,
    FilterComponent,
    ListPageComponent,
    MipsPaginationComponent,
    ProposalComponentsComponent,
    MipDetailsComponent,
    PullRequestHistoryComponent,
    DetailContentComponent,
    DetailsPageComponent,
    SearchMobileComponent,
    OrderMobileComponent,
    DetailsMobilesButtonsComponent,
    FeedbackComponent,
    FilterListComponent,
    FilterListItemComponent,
    FilterListHostDirective,
    MdCheckboxComponent,
    MdCheckboxMobileComponent,
    SubproposalsComponent,
    SideContentComponent,
    ReferencesComponent,
    OptionAutocompleteComponent,
    AutocompleteComponent,
    AutocompleteContentDirective,
    AutocompleteDirective,
    FilterPipe,
    InputFormattingComponent,
    InputFormattingRefDirective
  ],
  imports: [
    CommonModule,
    MipsRoutingModule,
    MatTableModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatPaginatorModule,
    InfiniteScrollModule,
    MatIconModule,
    MarkdownModule.forRoot({
      sanitize: SecurityContext.NONE
    }),
    OverlayModule,
    ReactiveFormsModule,
    FormsModule,
    ContenteditableValueAccessorModule
  ]
})
export class MipsModule { }
