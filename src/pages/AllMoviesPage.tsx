import React, { useEffect, useMemo, useState } from "react";
import AllMoviesList, { ScreeningsInfo } from "../components/AllMoviesList";
import useFetch from "../hook/useFetch";
import FilterDropdown from "../components/filter/FilterDropdown";
import "./PagesStyle/allmoviesPages.scss";
import FilterBtn from "../components/filter/FilterBtn";
import { Col, Container, Row } from "react-bootstrap";
import { formatDate, getLimitedSortedDates } from "../utils/date";
interface SelectedFilter {
  date: string | null;        // ISO (YYYY-MM-DD) or null = all dates
  auditorium: string | null;  // "Neo small" | "Neo big" | null = all
  age: boolean;               // true = under 15
}

export default function AllMoviesPage() {
  const { data, isLoading, error } = useFetch<ScreeningsInfo[]>("/api/screeningsInfo");


  const todayISO = useMemo(() => new Date().toISOString().split("T")[0], []);
  const todayLabel = useMemo(() => formatDate(todayISO), [todayISO]);

  const [selectedDateLabel, setSelectedDateLabel] = useState<string>(todayLabel);
  const [selectedAudLabel, setSelectedAudLabel] = useState<string>("Alla salonger");


const [filterOptions, setFilterOptions] = useState<SelectedFilter>({
  date: todayISO, // Shows todays date as default
  auditorium: null,
  age: false,
});


  const now = new Date();
  const upcoming = (data ?? []).filter(s => new Date(s.startTime) >= now);

  const limitedDays = useMemo(() => {
    const raw = upcoming.map(d => d.startTime.split("T")[0]);     
    return getLimitedSortedDates(raw);                           
  }, [upcoming]);

  const dateOptions = useMemo(
    () => limitedDays.map(d => ({ label: formatDate(d), value: d })),
    [limitedDays]
  );

  const auditoriumOptions = [
    { label: "Neo Lilla", value: "Neo Lilla" },
    { label: "Neo Stora", value: "Neo Stora" },
  ];

 
  const handleOnClickDate = (value: string) => {
    if (!value) { 
      setFilterOptions(prev => ({ ...prev, date: null }));
      setSelectedDateLabel("Alla datum");
    } else {
      setFilterOptions(prev => ({ ...prev, date: value }));
      setSelectedDateLabel(formatDate(value));
    }
  };

  const handleOnClickAuditorium = (value: string) => {
    if (!value) { 
      setFilterOptions(prev => ({ ...prev, auditorium: null }));
      setSelectedAudLabel("Alla salonger");
    } else {
      setFilterOptions(prev => ({ ...prev, auditorium: value }));
      setSelectedAudLabel(value);
    }
  };

  const handleOnClickAge = () => {
    setFilterOptions(prev => ({ ...prev, age: !prev.age }));
  };

 
  const filteredData = useMemo(() => {
    const base = upcoming;
    return base.filter(s =>
      (!filterOptions.date || s.startTime.split("T")[0] === filterOptions.date) &&
      (!filterOptions.auditorium || s.auditoriumName === filterOptions.auditorium) &&
      (!filterOptions.age || Number(s.info.ageLimit) < 15)
    );
  }, [upcoming, filterOptions]);

  return (
    <Container fluid className=" container-lg">
      <main className="all-movies-container">
        <Row className="text-container">
          <Row>
            <Col xs={12} md={4} lg={4}>
              <h1 className="all-movies-header">På bio just nu</h1>
            </Col>
          </Row>
          <Col>
            <p className="choose-text">
              Välj mellan våra två biografer och se vilka filmer som går
            </p>
          </Col>
        </Row>

        <Row className="mx-sm-5">
          <Col xs="4" md="auto">
            <FilterDropdown
              label="Välj ett datum"
              options={dateOptions}
              onClick={handleOnClickDate}
              allLabel="Alla datum"
              selectedLabel={selectedDateLabel}  
            />
          </Col>

          <Col xs="4" md="auto">
            <FilterDropdown
              label="Alla salonger"
              options={auditoriumOptions}
              onClick={handleOnClickAuditorium}
              allLabel="Alla salonger"
              selectedLabel={selectedAudLabel}
            />
          </Col>

          <Col xs="3" md="auto" className="d-flex align-items-end">
            <FilterBtn
              btnName={filterOptions.age ? ["Över 15"] : ["Under 15"]}
              onClick={handleOnClickAge}
            />
          </Col>
        </Row>

        {error && <p>Något gick fel: {error}</p>}
        {isLoading && <p>Loading...</p>}
        {data && <AllMoviesList movies={filteredData} />}
      </main>
    </Container>
  );
}