import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { browserHistory } from 'react-router';
import { Grid, Segment, Message, Header, Icon, Table } from 'semantic-ui-react';
import Actions from '../Actions';
import ProvinceList from '../components/List';
import ProvinceForm from '../components/Form';
import Province from '../models/Province';
import Page from 'layouts/App/Page';
import { animateTransition } from 'core/decorators';
import { DOM } from 'core/helpers';

interface Props {
    children: JSX.Element;
    router: any;
    params: any; 
}

interface State {
    isLoading: boolean;
    isSaving: boolean;
    models?: Array<Province>;
    model?: Province;
    validationErrors: any;
    iso2: string;
}

class ProvinceContainer extends React.Component<Props, State>  {
    
    formPanel: HTMLElement;    
    state: State = { 
        isLoading: false, 
        isSaving: false,
        models: new Array<Province>(),
        model: new Province(), 
        validationErrors: {},
        iso2: 'CA',
    };

    constructor(props: Props) {
        super(props);
        this.handleSelect = this.handleSelect.bind(this);
        this.loadModels = this.loadModels.bind(this);
    }
    
    componentDidMount() {                   
        this.formPanel = document.getElementById('pane-2').getElementsByClassName('form')[0] as HTMLElement;
        this.setState({isLoading: true}, this.loadModels);              
    }

    loadModels() {
        const { id } = this.props.params;
        Actions.getAll(this.state.iso2)
            .then((models: any) => {
                const model = (!!id && models.filter(({code}) => code === id)[0]) || new Province();            
                this.setState({ models, model, isLoading: false });
            });  
    }

    handleCountrySelect(iso2: any) {
        console.log(iso2);
        //this.setState({ iso2 }, this.loadModels);
    }

    handleFieldChange = (event: any): void => {
        event.preventDefault();
        const { name, value } = event.target;
        const state = Object.assign({}, {}, this.state.model);
        state[name] = value;
        this.setState({ model: state });
    }

    handleSignup (event): void {
        event.preventDefault();
        const { model } = this.state;

        this.setState({ isSaving: true });
        Actions.save(model, true)
            .then((response: any) => {
                this.setState({ isSaving: false });
            })
            .catch((response: any) => {
                const validationErrors = [];
                // new FormValidationError(response);
                console.log(validationErrors);
                // const validationErrors = [].concat(new FormValidationError(response.message, '', 'username'));
                this.setState({ isSaving: false, validationErrors });    
            });
    }

    isFormValid(): boolean {
        const { model } = this.state;
        return true; // model.isValid();
    }

    handleSelect(model) {
        DOM.animateElement(this.formPanel, () => {
            this.setState({ model });
            // Setting the routing slow down the model loading
            setTimeout(() => this.props.router.push(`/provinces/${model.code}`), 0); 
        }, 100);
    }

    render(): JSX.Element {
        const { isLoading, isSaving, models, model, validationErrors } = this.state;
        const panels: Array<React.ReactNode> = 
        [
            <ProvinceList 
                key="list"
                models={ models } 
                selected={ model } 
                onCountrySelected={ this.handleCountrySelect }
                onSelected={ this.handleSelect }
                isLoading={ isLoading }
            />,
            <ProvinceForm 
                key="form"                
                model={ model }
                onSubmit={ this.handleSignup }
                onChange={ this.handleFieldChange }
                errors={ validationErrors }
                isSaving={ isSaving }
                isValid={ this.isFormValid() }
            />,
        ];
        
        return (
            <Page id="province" 
                title="Province" 
                subTitle="Country Province"
                panels={ panels } />
        );
    } 
}

export default animateTransition()(ProvinceContainer);
