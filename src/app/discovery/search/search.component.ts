import { Component, OnInit } from '@angular/core';
import { FormArray, FormGroup } from '@angular/forms';
import { FormlyFieldConfig, FormlyFormOptions } from '@ngx-formly/core';
import { SchemaService } from '../../services/data/schema.service';
import { FormlyJsonschema } from '@ngx-formly/core/json-schema';
import { JSONSchema7 } from "json-schema";
import { filter, isEmpty } from 'rxjs/operators';
import { GeneralService } from '../../services/general/general.service';
import data from 'src/app/data';
import { ChangeDetectionStrategy } from '@angular/core';
import { of } from 'rxjs';



@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css'],
  changeDetection: ChangeDetectionStrategy.Default

})

export class SearchComponent implements OnInit {
  header: string = null;
  searchSchemas: any;
  filtered = [];
  searchString: any;

  fields: FormlyFieldConfig[] = [];
  data: any = [];

  form = new FormGroup({});
  model: any = {};
  options: FormlyFormOptions = {};
  isLoading: boolean = true;
  searchJson;
  cardFields = [];
  selectOption = {};

  activeTabIs: string = "institute";
  items = [];
  apiUrl: any;
  user: any;

  dropdownList = [];
  selectedItems = [];
  dropdownSettings = {
    singleSelection: false,
    text: "Select filter",
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    enableSearchFilter: true,
    classes: "myclass custom-class"
  };
  searchFields = {
    tabs: [
      {
        fields: [
          {
          }
        ]
      }
    ]
  };

  page: number = 1;
  limit: number;
  fieldsTemp = [];

  constructor(
    public schemaService: SchemaService,
    private formlyJsonschema: FormlyJsonschema,
    public generalService: GeneralService
  ) { }


  ngOnInit(): void {
    this.schemaService.getSearchJSON().subscribe((searchSchemas) => {
      this.searchSchemas = searchSchemas;

      let _self = this;
      Object.keys(_self.searchSchemas.searches).forEach(function (key) {
        _self.searchJson = _self.searchSchemas.searches[key];


        Object.keys(_self.searchJson).forEach(function (key1) {

          _self.filtered.push(_self.searchJson[key1]);

          if (_self.searchJson[key1].hasOwnProperty('activeTab') && _self.searchJson[key1].activeTab == 'active') {
            _self.activeTabIs = _self.searchJson[key1].tab;
            _self.apiUrl = _self.searchJson[key1].api;
          }

        })
      })

      if (this.searchSchemas.header) {
        this.header = this.searchSchemas.header;
        this.limit = this.searchSchemas.limit;
      }

      this.showFilter(this.filtered, this.activeTabIs);
    });

  }


  showFilter(filtered, activeTabIs) {

    filtered.forEach((fieldset, index) => {
      if (filtered[index].tab == activeTabIs) {
        this.data.push({
          fieldGroupClassName: 'row', fieldGroup: []
        });

        fieldset.filters.forEach((filter, index1) => {

          let fieldObj = {
            key: filter.key,
            type: 'input',
            className: 'col-6',
            templateOptions: {
              label: filter.title,
            }
          }


          /* if(filter.type == 'autocomplete')
           {
             fieldObj.type = 'autocomplete';
             fieldObj.templateOptions['filter'] = (term) => of(term ? this.states.filter(state =>
               state.toLowerCase().indexOf(term.toLowerCase()) > -1): this.states.slice())
 
           }*/

          this.dropdownList.push({ "id": filter.key, "itemName": filter.title, "data": fieldObj });

          if (filter.default) {
            this.data[0].fieldGroup.push(fieldObj);
            this.selectedItems.push({ "id": filter.key, "itemName": filter.title });
          }
        });

        this.fields = [this.data[0]];

        fieldset.results.fields.forEach((fields) => {
          this.cardFields.push(fields);
        });
      }
    });

    this.searchData();


  }

  searchData() {
    this.isLoading = true;

    this.searchString = {
      "filters": {
      }
    }

    let _self = this;

    Object.keys(_self.model).forEach(function (key) {
      _self.filtered.forEach((fieldset, index) => {
        if (_self.filtered[index].tab == _self.activeTabIs) {

          fieldset.filters.forEach((filter) => {

            if (key == filter.key) {
              _self.searchString.filters[filter.propertyPath] = {
                "startsWith": _self.model[key]
              };
            }
          });
        }
      });

    });


    this.generalService.postData(this.apiUrl, this.searchString).subscribe((res) => {
      // this.items = res;
      this.mapFieldsdata(res);
      this.isLoading = false;
    }, (err) => {
    });
  }

  mapFieldsdata(res) {

    res.forEach((item, index) => {
      this.fieldsTemp = [];

          this.cardFields.forEach((key, i) => {
           
            var property = key.property;
            var title = key.title;
            var propertySplit = property.split(".");

            let tempItem = [];
            
                    for (let j = 0; j < propertySplit.length; j++) {
                      let a = propertySplit[j];

                      if (j == 0 && item.hasOwnProperty(a)) {
                        tempItem = item[a];
                      } else if(tempItem.hasOwnProperty(a)){

                        
                          tempItem = tempItem[a];
                        
                      }else if(tempItem[0]){
                        if(tempItem.length > 0){
                          tempItem = tempItem[0][a];

                        }else{
                          tempItem = tempItem[a];
                        }

                      }else{
                        tempItem = [];
                      }
                    }


               this.fieldsTemp.push({ 'title' :  title , "value" : tempItem });

          });

          this.items.push({ 'fields' : this.fieldsTemp ,
                          'data' : item})
    });

  }

  submit() {
    this.searchData();
  }


  resetModel(index) {
    this.model = {};
    this.searchData();
  }

  resetData() {
    this.fields = [];
  }

  onItemSelect(item: any) {
    this.fields = [];
    this.data[0].fieldGroup.push(item.data);
    this.fields = [this.data[0]];
  }
  OnItemDeSelect(item: any) {
    this.fields = [];
    this.fields = this.data[0].fieldGroup.filter(function (obj) {
      return obj.key !== item.id;
    });
    this.data[0].fieldGroup = this.fields;
  }

  onSelectAll(items: any) {
    for (let i = 0; i < items.length; i++) {
      this.data[0].fieldGroup.push(items[i].data);
    }
    this.fields = [this.data[0]];

  }

  onDeSelectAll(items: any) {
    this.data[0].fieldGroup = [];
    this.model = {};
  }

  searchInstituteData(event) {
    let apiUrl;
    // let filterData = this.searchData(event);
  }



  onTabChange(activeTabIs) {
    this.cardFields = [];
    this.fields = [];
    this.data = [];
    this.dropdownList = [];
    this.selectedItems = [];
    this.items = [];

    this.activeTabIs = activeTabIs;

    this.filtered.forEach((fieldset, index) => {
      if (this.filtered[index].tab == activeTabIs) {
        this.apiUrl = this.filtered[index].api;
      }
    });

    this.showFilter(this.filtered, activeTabIs);
  }

  showDetails(item) {
    this.user = [];
    this.user = item;
  }



}