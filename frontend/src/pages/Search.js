import React, { useState } from 'react';

import styles from './Search.module.css';
import { Col, Container, Row } from 'react-bootstrap';

import {
  Form,
  FormControl,
  FormCheck,
  InputGroup,
  Button,
} from 'react-bootstrap';

import {
  SEARCH_COURSES,
  SEARCH_COURSES_TEXTLESS,
} from '../queries/QueryStrings';

import { useLazyQuery } from '@apollo/react-hooks';

import Select from 'react-select';

import SearchResults from '../components/SearchResults';

import { useWindowDimensions } from '../components/WindowDimensionsProvider';

import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import 'rc-tooltip/assets/bootstrap.css';

import { debounce } from 'lodash';

const createSliderWithTooltip = Slider.createSliderWithTooltip;
const Range = createSliderWithTooltip(Slider.Range);

function App() {
  const { width } = useWindowDimensions();

  const isMobile = width < 768;

  var searchText = React.createRef();

  var [searchType, setSearchType] = React.useState();

  var sortby = React.createRef();
  var seasons = React.createRef();
  var skillsAreas = React.createRef();
  var credits = React.createRef();

  var [HideGraduate, setHideGraduate] = React.useState(true);
  var [HideCancelled, setHideCancelled] = React.useState(true);

  var [ratingBounds, setRatingBounds] = React.useState([0, 5]);
  var [workloadBounds, setWorkloadBounds] = React.useState([0, 5]);

  const sortby_options = [
    { label: 'Relevance', value: 'text' },
    { label: 'Course name', value: 'course_name' },
    { label: 'Course subject', value: 'subject' },
    { label: 'Course number', value: 'number' },
    { label: 'Rating (same professor)', value: 'rating_same' },
    { label: 'Rating (any professor)', value: 'rating_any' },
    { label: 'Workload', value: 'workload' },
    { label: 'Enrollment', value: 'enrollment' },
  ];

  const seasons_options = [
    { label: 'Fall 2020', value: '202003' },
    { label: 'Summer 2020', value: '202002' },
    { label: 'Spring 2020', value: '202001' },
    { label: 'Fall 2019', value: '201903' },
  ];

  const skills_areas_options = [
    { label: 'Humanities', value: 'HU' },
    { label: 'Social sciences', value: 'SO' },
    { label: 'Quantitative reasoning', value: 'QR' },
    { label: 'Sciences', value: 'SC' },
    { label: 'Writing', value: 'WR' },
    { label: 'Language: any', value: 'L' },
    { label: 'Language: L1', value: 'L1' },
    { label: 'Language: L2', value: 'L2' },
    { label: 'Language: L3', value: 'L3' },
    { label: 'Language: L4', value: 'L4' },
    { label: 'Language: L5', value: 'L5' },
  ];

  const credits_options = [
    { label: '0.5', value: '0.5' },
    { label: '1', value: '1' },
    { label: '1.5', value: '1.5' },
    { label: '2', value: '2' },
  ];

  var [
    executeTextlessSearch,
    { called: textlessCalled, loading: textlessLoading, data: textlessData },
  ] = useLazyQuery(SEARCH_COURSES_TEXTLESS);

  var [
    executeTextSearch,
    { called: textCalled, loading: textLoading, data: textData },
  ] = useLazyQuery(SEARCH_COURSES);

  const handleSubmit = event => {
    event.preventDefault();

    // TODO:
    //  - sorting
    //  - filter by skills and areas
    //  - filter by credit count
    //  - hide grad and cancelled
    //  - filter by rating and workload

    // - work on textless capabilities

    var processed_seasons = seasons.select.props.value;
    if (processed_seasons != null) {
      processed_seasons = processed_seasons.map(x => {
        return x.value;
      });
    }

    // if the bounds are unaltered, we need to set them to null
    // to include unrated courses
    var include_all_ratings = ratingBounds[0] === 0 && ratingBounds[1] === 5;
    var include_all_workloads =
      workloadBounds[0] === 0 && workloadBounds[1] === 5;

    console.log(include_all_ratings, include_all_workloads);

    if (searchText.value === '') {
      setSearchType('TEXTLESS');
      executeTextlessSearch({
        variables: {
          seasons: processed_seasons,
        },
      });
    } else {
      setSearchType('TEXT');
      executeTextSearch({
        variables: {
          search_text: searchText.value,
          seasons: processed_seasons,
          min_rating: include_all_ratings ? null : ratingBounds[0],
          max_rating: include_all_ratings ? null : ratingBounds[1],
          min_workload: include_all_workloads ? null : workloadBounds[0],
          max_workload: include_all_workloads ? null : workloadBounds[1],
        },
      });
    }
  };

  var results;

  if (searchType === 'TEXTLESS') {
    if (textlessCalled) {
      if (textlessLoading) {
        results = <div>Loading...</div>;
      } else {
        if (textlessData) {
          results = <SearchResults data={textlessData.courses} />;
        }
      }
    }
  } else if (searchType === 'TEXT') {
    if (textCalled) {
      if (textLoading) {
        results = <div>Loading...</div>;
      } else {
        if (textData) {
          results = <SearchResults data={textData.search_course_info} />;
        }
      }
    }
  }

  return (
    <div className={styles.search_base}>
      <Row className={styles.nopad + ' ' + styles.nomargin}>
        <Col
          md={4}
          className={
            'm-0 px-4 py-4 ' +
            (isMobile ? styles.search_col_mobile : styles.search_col)
          }
        >
          <Form className={styles.search_container} onSubmit={handleSubmit}>
            <div className={styles.search_bar}>
              <InputGroup className={styles.search_input}>
                <FormControl
                  type="text"
                  placeholder="Find a class..."
                  ref={ref => {
                    searchText = ref;
                  }}
                />
              </InputGroup>
            </div>

            <div className={'container ' + styles.search_options_container}>
              <Row className="py-2">
                <div className={'col-md-4 ' + styles.nopad}>
                  Sort by{' '}
                  <Select
                    defaultValue={sortby_options[0]}
                    options={sortby_options}
                    ref={ref => {
                      sortby = ref;
                    }}
                  />
                </div>
                <div className={'col-md-8 ' + styles.nopad}>
                  Semesters{' '}
                  <Select
                    isMulti
                    defaultValue={[seasons_options[0]]}
                    options={seasons_options}
                    ref={ref => {
                      seasons = ref;
                    }}
                    placeholder="All"
                  />
                </div>
              </Row>
              <Row className="py-2">
                <div className={'col-md-8 ' + styles.nopad}>
                  Skills and areas
                  <Select
                    isMulti
                    options={skills_areas_options}
                    placeholder="Any"
                    ref={ref => {
                      skillsAreas = ref;
                    }}
                  />
                </div>
                <div className={'col-md-4 ' + styles.nopad}>
                  Credits
                  <Select
                    isMulti
                    options={credits_options}
                    placeholder="Any"
                    ref={ref => {
                      credits = ref;
                    }}
                  />
                </div>
              </Row>
              <Row className="py-2">
                <FormCheck type="switch" className={styles.toggle_option}>
                  <FormCheck.Input checked={HideGraduate} />
                  <FormCheck.Label
                    onClick={() => setHideGraduate(!HideGraduate)}
                  >
                    Hide graduate courses
                  </FormCheck.Label>
                </FormCheck>
                <Form.Check type="switch" className={styles.toggle_option}>
                  <Form.Check.Input checked={HideCancelled} />
                  <Form.Check.Label
                    onClick={() => setHideCancelled(!HideCancelled)}
                  >
                    Hide cancelled courses
                  </Form.Check.Label>
                </Form.Check>
              </Row>
              <Row className={styles.sliders}>
                Overall ratings
                <Container>
                  <Range
                    min={0}
                    max={5}
                    step={0.1}
                    defaultValue={ratingBounds}
                    onChange={value => {
                      setRatingBounds(value);
                    }}
                    tipProps={{
                      visible: true,
                      align: { offset: [0, 4] },
                    }}
                    className={styles.slider}
                  />
                </Container>
                Workload
                <Container>
                  <Range
                    min={0}
                    max={5}
                    step={0.1}
                    defaultValue={workloadBounds}
                    onChange={value => {
                      setWorkloadBounds(value);
                    }}
                    tipProps={{
                      visible: true,
                      align: { offset: [0, 4] },
                    }}
                    className={styles.slider}
                  />
                </Container>
              </Row>
              <Row className="pt-3 text-right flex-row-reverse">
                <Button
                  type="submit"
                  className={'pull-right ' + styles.secondary_submit}
                >
                  Search
                </Button>
              </Row>
            </div>
          </Form>
        </Col>
        <Col md={8} className={'m-0 p-0 ' + styles.results_col}>
          {results}
        </Col>
      </Row>
    </div>
  );
}

export default App;
