package com.powerledger.suburbia;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.hamcrest.Matchers.contains;
import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class PostcodesControllerTests {

	private static final String NAMES = "$['suburb names:']";
	private static final String TOTAL = "$['total chars']";

	@Autowired
	private MockMvc mvc;

	@Test
	void allStatesAreLoadedAtStartup() throws Exception {
		mvc.perform(get("/6000/6005"))
				.andExpect(status().isOk())
				.andExpect(jsonPath(NAMES + "[0]").value("City Delivery Centre"));
		mvc.perform(get("/2600/2601"))
				.andExpect(status().isOk())
				.andExpect(jsonPath(NAMES, hasSize(16)))
				.andExpect(jsonPath(TOTAL).value(139));
	}

	@Test
	void rangeAcceptsPostcodesWithoutLeadingZeros() throws Exception {
		mvc.perform(get("/200/221"))
				.andExpect(status().isOk())
				.andExpect(jsonPath(NAMES, contains("Administrative Postcode Only", "Barton")))
				.andExpect(jsonPath(TOTAL).value(32));
	}

	@Test
	void rangeIsClampedToValidPostcodes() throws Exception {
		mvc.perform(get("/-5/221"))
				.andExpect(status().isOk())
				.andExpect(jsonPath(NAMES, hasSize(2)));
		mvc.perform(get("/9990/2147483647"))
				.andExpect(status().isOk())
				.andExpect(jsonPath(NAMES, hasSize(0)));
	}

	@Test
	void reversedRangeIsEmpty() throws Exception {
		mvc.perform(get("/2601/2600"))
				.andExpect(status().isOk())
				.andExpect(jsonPath(NAMES, hasSize(0)))
				.andExpect(jsonPath(TOTAL).value(0));
	}

	@Test
	void stateReturnsItsPostcodesWithLeadingZeros() throws Exception {
		mvc.perform(get("/ACT"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$", hasSize(30)))
				.andExpect(jsonPath("$[0].postcode").value("0200"))
				.andExpect(jsonPath("$[0].name[0]").value("Administrative Postcode Only"));
	}

	@Test
	void stateIsCaseInsensitive() throws Exception {
		mvc.perform(get("/nt"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$", hasSize(41)))
				.andExpect(jsonPath("$[0].postcode").value("0800"));
	}

	@Test
	void unknownStateIsNotFound() throws Exception {
		mvc.perform(get("/XX")).andExpect(status().isNotFound());
		mvc.perform(get("/postcodes")).andExpect(status().isNotFound());
	}

	@Test
	@Transactional
	void postUpsertsPostcodes() throws Exception {
		mvc.perform(post("/postcodes").contentType(MediaType.APPLICATION_JSON)
						.content("[{\"postcode\":\"9999\",\"name\":[\"Testville\"]},{\"postcode\":\"2601\",\"name\":[\"Renamed\"]}]"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$", hasSize(3281)));
		mvc.perform(get("/9999/9999"))
				.andExpect(jsonPath(NAMES, contains("Testville")));
		mvc.perform(get("/2601/2601"))
				.andExpect(jsonPath(NAMES, contains("Renamed")));
	}

	@Test
	void postRejectsInvalidPostcodes() throws Exception {
		String[] invalid = {
				"[{\"name\":[\"NoCode\"]}]",
				"[{\"postcode\":\"12\",\"name\":[\"Short\"]}]",
				"[{\"postcode\":\"12345\",\"name\":[\"Long\"]}]",
				"[{\"postcode\":\"abcd\",\"name\":[\"Letters\"]}]",
				"[{\"postcode\":\"9998\",\"name\":null}]",
				"[{\"postcode\":\"9998\",\"name\":[]}]",
				"[{\"postcode\":\"9998\",\"name\":[\" \"]}]",
				"[{\"postcode\":\"9997\",\"name\":[\"Valid\"]},null]"
		};
		for (String body : invalid) {
			mvc.perform(post("/postcodes").contentType(MediaType.APPLICATION_JSON).content(body))
					.andExpect(status().isBadRequest());
		}
		mvc.perform(get("/9997/9998"))
				.andExpect(jsonPath(NAMES, hasSize(0)));
	}

}
